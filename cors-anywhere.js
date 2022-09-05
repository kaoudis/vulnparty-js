const proxy = require("cors-anywhere");

const logger = require("./logger");
const corsHost = "127.0.0.1";
const corsPort = 8889;

const allowlist = [
    // not populated by default,
    // but please mess around and try adding stuff
];

const denylist = [
    // should be trivial to get around
    "127.0.0.1",
];

const requiredRequestHeaders = [
];

const denylistedRequestHeaders = [
    "Authorization",
    "Cookie",
];

const corsProxyServer = proxy
    .createServer({
        originWhitelist: allowlist,
        originBlacklist: denylist,
        requireHeader: requiredRequestHeaders,
        removeHeaders: denylistedRequestHeaders,
    });

module.exports.corsHost = corsHost;
module.exports.corsPort = corsPort;
module.exports.corsProxyServer = corsProxyServer;