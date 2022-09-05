const fs = require("fs");

const { headers } = require("./get");
const logger = require("./logger");

const getBookByName = (bookName, response) => {
  if (bookName.endsWith(".pdf")) {
    // check for the file locally on the server
    const path = `library/books/${bookName}`;
    fs.readFile(path, (err, bookData) => {
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

  return response;
};

module.exports = getBookByName;
