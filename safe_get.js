const netmask = require("netmask");

const url = require("url");

const logger = require("./logger");
const { getNext } = require("./dns_lookups");

const { headers } = require("./get");

// What if someone simply decided to replace the use of private-ip in get.js
// with another library, which in this case (oooops) happens to be vuln as
// well? That's basically what we have here - a perfectly reasonable response
// to a vuln report which still doesn't end well. There are many cases where,
// without appropriate guidance and simply the direction to "fix an app relying
// on a vulnerable Javascript library", a well intentioned developer might just
// rearrange the figurative deck chairs and leave the code still vuln, or
// even (as here) replace one vuln with another, with several other vulns untouched.
const safe_get = (privado, request, response) => {
  const queryParams = url.parse(request.url, true).query;
  // requires at least the parameter 'nextRequest' set to an IP or similar
  const loc = queryParams.nextRequest;
  logger.debug("attempting to request (raw address passed by client): " + loc);

  if (loc !== null && loc !== "") {
    // just dump the entire unsanitized user input into netmask!
    const acceptable = privado ? isPrivate(loc) : !isPrivate(loc);

    if (acceptable) {
      const msg = `attempting to request (private=${privado}) 'nextRequest' location ${loc}\n`;
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

  return response;
};

// uses the private ranges defined in the 1996 RFC 1918,
// https://datatracker.ietf.org/doc/html/rfc1918, and netmask 1.0.6
const privateBlock1 = new netmask.Netmask("10.0.0.0/8");
const privateBlock2 = new netmask.Netmask("172.16.0.0/12");
const privateBlock3 = new netmask.Netmask("192.168.0.0/16");

const isPrivate = (ip) => {
  // note that this approach is incomplete *and* it doesn't take into account ipv6
  if (
    privateBlock1.contains(ip) ||
    privateBlock2.contains(ip) ||
    privateBlock3.contains(ip)
  ) {
    return true;
  }

  return false;
};

module.exports = safe_get;
