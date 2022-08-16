const dns = require("dns");

// do not pass user input unsanitized! this is only for demo purposes.
const getNext = (nextLocation) => {
  dns.lookup(nextLocation, {}, (err, address, family) => {
    if (err || address === null || family === null) {
      logger.error(err);
    } else {
      // don't do this
      const loc = !address.startsWith("http") ? "http://" + address : address;
      axios
        .get(loc)
        .then((response) => {
          logger.info("Requested " + loc);
          logger.debug(response);
        })
        .catch((err) => {
          logger.error("UH OH: request (to " + loc + ") failed: ");
          logger.error(err.errno);
          logger.error(err.config);
        });
    }
  });
}

const requestHost = (hostHeader, response) => {
    dns.lookup(hostHeader, {}, (err, address, _) => {
      if (err || address === null) {
        logger.error(err);
      } else if (privateIp(address)) {
        const loc = !address.startsWith("http") ? "http://" + address : address;
        axios
          .get(loc)
          .then((response) => {
            logger.info("Requested " + loc);
            logger.debug(response);
          })
          .catch((err) => {
            logger.error("UH OH: request (to " + loc + ") failed");
            logger.error(err.errno);
            logger.error(err.config);
          });
      } else {
        let msg = "requested host did not resolve to private ip";
        response.writeHead(400, headers);
        response.end(msg);
      }
    });
  }
  
const patch = (request, response) => {
  requestHost(request.headers.host, response);
};

module.exports = {
  getNext,
  patch,
};
