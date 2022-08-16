// vulnerable version of private-ip (see package-lock)
const privateIp = require("private-ip");
const { response } = require("express");
const url = require("url");

const logger = require("./logger");
const { getNext } = require("./dns_lookups");

const headers = { "Content-Type": "text/html" };

const get = (privado, request, response) => {
    const queryParams = url.parse(request.url, true).query;
    // requires at least the parameter 'nextRequest' set to an IP or similar
    const loc = queryParams.nextRequest;
    logger.debug("attempting to request (raw address passed by client): " + loc);

    if (loc !== null && loc !== "") {
        // just dump the entire unsanitized user input into privateIp()! this is not
        // ideally what would occur. private-ip after v1.0.5 will rightly only check
        // IP addresses and not an ip with scheme and/or port, but v1.0.5 will do
        // some fun stuff...
        const acceptable = privado ? privateIp(loc) : !privateIp(loc);

        if (acceptable) {
        const msg = `attempting to request (private=${privado}) \'nextRequest\' location ${loc}\n`;
        logger.debug(msg);
        getNext(loc);
        response.writeHead(200, headers);
        response.end(msg);
        } else {
        logger.error(`would not request ${loc}\n`);
        response.writeHead(403, headers);
        response.end(`would not request ${loc}\n`);
        }
    } else {
        logger.error("parameter 'nextRequest' not passed; returning 400");
        response.writeHead(400, headers);
        response.end("we require 'nextRequest' parameter on request");
    }
};

module.exports.get = get;
module.exports.headers = headers;
