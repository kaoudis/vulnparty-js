const express = require("express");
const { response } = require("express");
const url = require("url");

const { corsHost, corsPort, corsProxyServer } = require("./cors-anywhere");
const ftpGet = require("./ftp");
const { get, headers } = require("./get");
const { getNext, patch } = require("./dns_lookups");
const getBookByName = require("./books");
const safeGet = require("./safe_get");
const logger = require("./logger");

const app = express();
const server = require("http").Server(app);
const port = 8888;

// no middleware for now I guess.
// could require some headers here or add Helmet or such.
app.use((request, response, next) => {
  next();
});

// start the cors-anywhere proxy
corsProxyServer.listen(corsPort, corsHost, function () {
  logger.info(`Starting CORS Anywhere Proxy on ${corsHost}:${corsPort}`);
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

// if the potential nextRequest location is "private" according to
// netmask 1.0.6, request it
app.get("/safe_private", (request, response) => {
  logger.debug("GET /safe_private");
  safeGet(true, request, response);
});

// if the potential nextRequest location is "public" according to
// netmask 1.0.6, request it
app.get("/safe_public", (request, response) => {
  logger.debug("GET /safe_public");
  safeGet(false, request, response);
});

// performs a DNS lookup to figure out whether or not to request a thing
app.get("/next/:nextRequest", (request, _) => {
  logger.debug(`GET /next/${request.params.nextRequest}`);
  getNext(request.params.nextRequest);
});

// retrieve a file! which could be a pdf!
app.get("/library/books/:bookFileName", (request, response) => {
  logger.debug(`GET /library/books/${request.params.bookFileName}`);
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

app.patch("/host", (request, response) => {
  logger.debug("PATCH /host");
  patch(request, response);
});

app.get("/cors-anywhere", (request, response) => {
  const queryParams = url.parse(request.url, true).query;
  const url = queryParams.nextRequest;

  // see https://github.com/Rob--W/cors-anywhere/blob/master/lib/cors-anywhere.js#L39
  // in order to understand what is disallowed

  // plonk that untrusted user input rightttt into the redirect
  const redirect = `http://${corsHost}:${corsPort}/${url}`;
  logger.debug(`GET '/cors-anywhere?nextRequest=${url}', redirecting to ${redirect}`);
  response.redirect(302, `${redirect}`);
});

module.exports = server.listen(port, (err) => {
  if (err) {
    logger.error(err);
    throw err;
  }

  logger.debug("started server on port " + port + "...");
});
