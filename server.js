const express = require('express');
const got = require('got');
// we are specifically using a vulnerable version of private-ip
const privateIp = require('private-ip');
const url = require('url');

// never do this - do not pass user input unsanitized
// and this is awful code anyway.
async function getNext(nextLocation) {
    try {
        // janky but just to make this work for now (got likes a scheme)
        const schemePrefix = 'http';
        const requestUrl = !nextLocation.startsWith(schemePrefix) ? schemePrefix + '://' + nextLocation : nextLocation;
        const response = await got(requestUrl);
        console.log('response code: ' + response.statusCode);
        console.log('response: ' + response.body);
    } catch (err) {
        console.log('UH OH: got back an error');
        console.log(err);
    }
}

const get = (privado, request, response) => {
    const loc = url.parse(request.url, true).query.nextRequest;
    // requires at least the parameter 'nextRequest' set to an IP address or similar
    console.log('next request will go to (raw): ' + loc);

    const acceptable = privado ? privateIp(loc) : !privateIp(loc);
    const headers = {'Content-Type': 'text/html'};

    if (acceptable) {
        getNext(loc);
        response.writeHead(200, headers);
        response.end('boom!');
    } else {
        response.writeHead(403, headers);
        response.end('problemas: will not request ' + loc);
    }
}

const errs = (err, response) => {
    console.log('errors: ');
    console.log(err);
}

const app = express();
const server = require('http').Server(app);
const port = 8888;

// no middleware for now I guess
app.use((request, response, next) => {
    next();
});

app.get('/private', (request, response) => {
    console.log('GET /private...');
    get(true, request, response);
});

app.get('/public', (request, response) => {
    get(false, request, response);
});

server.listen(port, (err) => {
    if (err) {
        throw err;
    }

    console.log('started server on port ' + port + '...');
});

module.exports = server;
