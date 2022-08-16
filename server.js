const axios = require("axios").create({ proxy: false });
const curl = require("node-libcurl");
const express = require("express");
const ftp = require("ftp");
// vulnerable version of private-ip (see package-lock)
const privateIp = require("private-ip");
const url = require("url");

const { createLogger, format, transports, winston } = require("winston");
const { response } = require("express");
const { combine, timestamp, prettyPrint } = format;

const { getNext, patch } = require("./dns_lookups");
const getBookByName = require("./books");

const headers = { "Content-Type": "text/html" };

const logger = createLogger({
  format: combine(timestamp(), prettyPrint()),
  transports: [
    new transports.Console({ level: "info" }),
    new transports.File({
      filename: "server_info.log",
      level: "debug",
    }),
  ],
});

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

const ftpGet = (loc, fileName, response) => {
  const ftpClient = new ftp();
  ftpClient.on("ready", () => {
    ftpClient.get(fileName, (error, stream) => {
      if (error) {
        logger.error(error);
        // never do this - there's no reason
        response.writeHead(500, headers);
        response.end(`internal server error: ${error}`);
      } else {
        logger.debug("closing stream");
        stream.once("close", () => {
          ftpClient.end();
        });
        stream.pipe((output) => {
          logger.debug("got file!");
          response.writeHead(200, headers);
          response.end(output);
        });
      }
    });
  });

  logger.debug(`connecting to ${loc} to retrieve ${fileName}`);
  // connect as anonymous user
  ftpClient.connect(loc);
};

const curlPost = (requestBody) => {};

const app = express();
const server = require("http").Server(app);
const port = 8888;

// no middleware for now I guess.
// could require some headers here or add Helmet or such.
app.use((request, response, next) => {
  next();
});

// if the potential nextRequest location is "private" according to
// private-ip 1.0.5, request it
app.get("/private", (request, response) => {
  logger.debug("GET /private");
  get(true, request, response);
});

// if the potential nextRequest location is "public" according to
// private-ip 1.0.5, request it
app.get("/public", (request, response) => {
  logger.debug("GET /public");
  get(false, request, response);
});

// inspired by cors-anywhere
app.get("/next/:nextRequest", (request, response) => {
  logger.debug(`GET ${request.params.nextRequest}`);
  getNext(request.params.nextRequest);
});

// retrieve a file! which could be a pdf!
app.get("/library/books/:bookFileName", (request, response) => {
  logger.debug(`GET ${request.params.bookFileName}`);
  getBookByName(request.params.bookFileName, response);
});

// retrieve a remote file and output it to console
app.get("/ftp", (request, response) => {
  const queryParams = url.parse(request.url, true).query;
  const loc = queryParams.nextRequest;
  const fileName = queryParams.file;

  // Denylist sketch. the idea here is to show how a well-intentioned denylist
  // may not end up providing that much security since there are plenty of ways
  // to get around this.
  if (
    !fileName.includes("localhost") &&
    !loc.includes("localhost") &&
    !loc.includes("127.0.0.1")
  ) {
    logger.debug(`GET ${fileName} from ftp://${loc}`);
    ftpGet(loc, fileName, response);
  } else {
    logger.error(`will not retrieve ${fileName} from ftp://${loc}`);
    response.writeHead(400, headers);
    response.end("did you include the `file` and `nextRequest` parameters?");
  }
});

// curl allows some more exotic schemas which may be interesting to try out
app.post("/curl", (request, response) => {
  logger.debug("POST /curl");
  curlPost(request.body, response);
});

// this time, use the Host header
app.patch("/host", (request, response) => {
  logger.debug("PATCH /host");
  patch(request, response);
});

module.exports = server.listen(port, (err) => {
  if (err) {
    logger.error(err);
    throw err;
  }

  logger.debug("started server on port " + port + "...");
});
