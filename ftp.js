const ftp = require("ftp");

const { headers } = require("./get");
const logger = require("./logger");

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

module.exports = ftpGet;
