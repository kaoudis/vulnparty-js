const axios = require('axios').create({proxy: false});
const dns = require('dns');
const express = require('express');
const ftp = require('ftp');
// we are specifically using a vulnerable version of private-ip
const privateIp = require('private-ip');
const url = require('url');

const { createLogger, format, transports, winston } = require('winston');
const { combine, timestamp, prettyPrint } = format;

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
		const headers = {'Content-Type': 'text/html'};

		if (acceptable) {
			getNext(loc);
			response.writeHead(200, headers);
			response.end(`attempt to request \'nextRequest\' location ${loc}!\n`);
		} else {
			logger.error(`would not request ${loc}\n`);
			response.writeHead(403, headers);
			logger.error(`problemas: will not request ${loc}\n`);
		}
	} else {
		logger.error('parameter \'nextRequest\' not passed; returning 400');
		response.writeHead(400, headers);
		response.end('we require \'nextRequest\' parameter on request');    
	}
}

const ftpGet = (loc, fileName) => {
	const ftpClient = new ftp();
	ftpClient.on('ready', () => {
		ftpClient.get(fileName, (error, stream) => {
			if (error) {
				logger.error(error);
				throw error;
			}

			logger.debug('closing stream');
			stream.once('close', () => { ftpClient.end(); });
			stream.pipe((output) => { console.log(output); });
		});
	});

	logger.debug(`connecting to ${loc} to retrieve ${fileName}`);
	// connect as anonymous user
	ftpClient.connect(loc);
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

// retrieve a remote file and output it to console
app.get('/ftp', (request, response) => {
	const queryParams = url.parse(request.url, true).query;
	const loc = queryParams.nextRequest;
	const fileName = queryParams.file;	

	// denylist sketch
	if (!fileName.includes('localhost') && !loc.includes('localhost') && !loc.includes('127.0.0.1')) {
		logger.debug(`GET ${fileName} from ftp://${loc}`);
		ftpGet(loc, fileName);
		// just empty 200 response for now
		response.writeHead(200, headers);
	} else {
		logger.error(`will not retrieve ${fileName} from ftp://${loc}`);
		response.writeHead(400, headers);
		response.end('we require \'nextRequest\' parameter on request');    
	}
});

module.exports = server.listen(port, (err) => {
	if (err) {
		logger.error(err);
		throw err;
	}

	logger.debug('started server on port ' + port + '...');
});
