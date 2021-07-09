const axios = require('axios').create({proxy: false});
const dns = require('dns');
const express = require('express');
// we are specifically using a vulnerable version of private-ip
const privateIp = require('private-ip');
const url = require('url');

// do not pass user input unsanitized! this is only for demo purposes.
// it's also kind of gross generally.
async function getNext(nextLocation) {
    await dns.lookup(nextLocation, {}, (err, address, family) => {
        if (err) {
            console.log(err);
        } else {
            const loc = !address.startsWith('http') ? 'http://' + address : address;
            axios.get(loc)
                .then(response => {
                    console.log('Requested ' + loc);
                    console.log(response);
                })
                .catch(err => {
                    console.log('UH OH: request (to ' + loc + ') failed: ');
                    console.log(err);
            });
        }
    });
}

const get = (privado, request, response) => {
    const queryParams = url.parse(request.url, true).query;
    const loc = queryParams.nextRequest;
    // requires at least the parameter 'nextRequest' set to an IP address or similar
    console.log('attempting to request (raw address passed by client): ' + loc);

    const acceptable = privado ? privateIp(loc) : !privateIp(loc);
    const headers = {'Content-Type': 'text/html'};

    if (acceptable) {
        getNext(loc);
        response.writeHead(200, headers);
        response.end('attempted to hit ' + loc);
    } else {
        console.log('would not request ' + loc);
        response.writeHead(403, headers);
        response.end('problemas: will not request ' + loc);
    }
}

const app = express();
const server = require('http').Server(app);
const port = 8888;

// no middleware for now I guess.
// could require some headers here or add Helmet or such.
app.use((request, response, next) => {
    next();
});

app.get('/private', (request, response) => {
    console.log('GET /private');
    get(true, request, response);
});

app.get('/public', (request, response) => {
    console.log('GET /public')
    get(false, request, response);
});

server.listen(port, (err) => {
    if (err) {
        throw err;
    }

    console.log('started server on port ' + port + '...');
});

module.exports = server;
