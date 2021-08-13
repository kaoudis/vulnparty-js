const axios = require('axios').create({proxy: false});
const curl = require('node-libcurl');
const dns = require('dns');
const express = require('express');
const fs = require('fs');
const ftp = require('ftp');
// we are specifically using a vulnerable version of private-ip
const privateIp = require('private-ip');
const url = require('url');

const { createLogger, format, transports, winston } = require('winston');
const { response } = require('express');
const { combine, timestamp, prettyPrint } = format;

const headers = {'Content-Type': 'text/html'};

const logger = createLogger({
	format: combine(
		timestamp(),
		prettyPrint()
	),
	transports: [
		new transports.Console({ level: 'info' }),
		new transports.File({
			filename: 'server_info.log',
			level: 'debug'
		})
	]
});


// do not pass user input unsanitized! this is only for demo purposes.
// it's also kind of gross generally.
async function getNext(nextLocation) {
	await dns.lookup(nextLocation, {}, (err, address, family) => {
		if (err || address === null) {
			logger.error(err);
		} else {
			const loc = !address.startsWith('http') ? 'http://' + address : address;
			axios.get(loc)
				.then(response => {
					logger.info('Requested ' + loc);
					logger.debug(response);
				})
				.catch(err => {
					logger.error('UH OH: request (to ' + loc + ') failed: ');
					logger.error(err);
				});
		}
	});
}

const get = (privado, request, response) => {
	const queryParams = url.parse(request.url, true).query;
	// requires at least the parameter 'nextRequest' set to an IP or similar
	const loc = queryParams.nextRequest;
	logger.debug('attempting to request (raw address passed by client): ' + loc);

	if (loc !== null && loc !== '') {
		// just dump the entire unsanitized user input into privateIp()! this is not
		// ideally what would occur. private-ip after 1.0.5 will rightly only check
		// IP addresses and not an ip with scheme and/or port, but 1.0.5 will do
		// some fun stuff...
		const acceptable = privado ? privateIp(loc) : !privateIp(loc);

		if (acceptable) {
			getNext(loc);
			logger.debug(`attempt to request \'nextRequest\' location ${loc}!\n`);
			response.writeHead(200, headers);
			response.end(`attempt to request \'nextRequest\' location ${loc}!\n`);
		} else {
			logger.error(`would not request ${loc}\n`);
			response.writeHead(403, headers);
			response.end(`would not request ${loc}\n`);
		}
	} else {
		logger.error('parameter \'nextRequest\' not passed; returning 400');
		response.writeHead(400, headers);
		response.end('we require \'nextRequest\' parameter on request');
	}
}

const getBookByName = (bookName, response) => {
	if (bookName.endsWith(".pdf")) {
		// check for the file locally on the server
		fs.readFile(bookName, (err, bookData) => {
			if (err) {
				logger.error(err);
				response.writeHead(500, headers);
				// never do this - there's no reason to pass back
				// any kind of internal server error info to the client.
				// not even useful information unless the client is a hacker.
				response.end(`internal server error: ${err}`);
			} else {
				// never do this either - we have no idea what this file is
				// we're just dumping it out bang to the client
				response.writeHead(200, headers);
				response.end(bookData);
			}
		});
	} else {
			let msg = `unacceptable file extension requested (as part of bookFileName '${bookName}')`;

		logger.error(msg);
		response.writeHead(400, headers);
		response.end(msg);
	}
}

const ftpGet = (loc, fileName, response) => {
	const ftpClient = new ftp();
	ftpClient.on('ready', () => {
		ftpClient.get(fileName, (error, stream) => {
			if (error) {
				logger.error(error);
				// never do this - there's no reason
				response.writeHead(500, headers);
				response.end(`internal server error: ${error}`);
			} else {
				logger.debug('closing stream');
				stream.once('close', () => { ftpClient.end(); });
				stream.pipe((output) => {
					logger.debug('got file!');
					response.writeHead(200, headers);
					response.end(output);
				});
			}
		});
	});

	logger.debug(`connecting to ${loc} to retrieve ${fileName}`);
	// connect as anonymous user
	ftpClient.connect(loc);
}

const curlPost = (requestBody) => {


}

async function requestHost(hostHeader, response) {
	await dns.lookup(hostHeader, {}, (err, address, _) => {
		if (err || address === null) {
			logger.error(err);
		} else if (privateIp(address)) {
			const loc = !address.startsWith('http') ? 'http://' + address : address;
			axios.get(loc)
				.then(response => {
					logger.info('Requested ' + loc);
					logger.debug(response);
				})
				.catch(err => {
					logger.error('UH OH: request (to ' + loc + ') failed: ');
					logger.error(err);
				});
		} else {
			let msg = 'requested host did not resolve to private ip';
			response.writeHead(400, headers);
			response.end(msg);
		}
	});
}

const patch = (request, response) => {
	requestHost(request.headers.host, response);
}

const app = express();
const server = require('http').Server(app);
const port = 8888;

// no middleware for now I guess.
// could require some headers here or add Helmet or such.
app.use((request, response, next) => {
	next();
});

// if the potential nextRequest location is "private" according to
// private-ip 1.0.5, request it
app.get('/private', (request, response) => {
	logger.debug('GET /private');
	get(true, request, response);
});

// if the potential nextRequest location is "public" according to
// private-ip 1.0.5, request it
app.get('/public', (request, response) => {
	logger.debug('GET /public')
	get(false, request, response);
});

// inspired by cors-anywhere
app.get('/next/:nextRequest', (request, response) => {
	logger.debug(`GET ${request.params.nextRequest}`);
	getNext(request.params.nextRequest);
});

//retrieve a file! which could be a pdf!
app.get('/library/books/:bookFileName', (request, response) => {
	logger.debug(`GET ${request.params.bookFileName}`);
	getBookByName(request.params.bookFileName, response);
});

// retrieve a remote file and output it to console
app.get('/ftp', (request, response) => {
	const queryParams = url.parse(request.url, true).query;
	const loc = queryParams.nextRequest;
	const fileName = queryParams.file;

	// denylist sketch. the idea here is to show how a well-intentioned denylist may not end up
	// providing that much security since there are plenty of ways to get around this.
	if (!fileName.includes('localhost') && !loc.includes('localhost') && !loc.includes('127.0.0.1')) {
		logger.debug(`GET ${fileName} from ftp://${loc}`);
		ftpGet(loc, fileName, response);
	} else {
		logger.error(`will not retrieve ${fileName} from ftp://${loc}`);
		response.writeHead(400, headers);
		response.end('did you include the `file` and `nextRequest` parameters?');
	}
});

// curl allows some more exotic schemas which may be interesting to try out
app.post('/curl', (request, response) => {
    logger.debug('POST /curl');
    curlPost(request.body, response);
});

// this time, use the Host header
app.patch('/host', (request, response) => {
    logger.debug('PATCH /host');
    patch(request, response);
});


module.exports = server.listen(port, (err) => {
	if (err) {
		logger.error(err);
		throw err;
	}

	logger.debug('started server on port ' + port + '...');
});
