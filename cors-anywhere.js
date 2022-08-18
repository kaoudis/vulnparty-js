const proxy = require("cors-anywhere");

const logger = require("./logger");
const corsHost = "127.0.0.1";
const corsPort = 8889;

const allowlist = [
    // not populated by default, 
    // but please mess around and try adding stuff
];

const requiredRequestHeaders = [
    "Origin",
];

const denylistedRequestHeaders = [
    "Authorization",
    "Cookie",
];

const startupTasks = () => {
    logger.info(`Starting CORS Anywhere Proxy on ${corsHost}:${corsPort}`);
    logger.info("CORS proxy requires request headers: ");
    requiredRequestHeaders.forEach(function (header) {logger.info(`${header},`)});
    logger.info("CORS proxy disallows the following request headers: ");
    denylistedRequestHeaders.forEach(function (header) {logger.info(`${header},`)});
};

proxy
    .createServer({
        originWhitelist: allowlist,
        requireHeader: requiredRequestHeaders,
        removeHeaders: denylistedRequestHeaders,
    }).listen(
        corsPort, 
        corsHost, 
        startupTasks
    );

module.exports.corsHost = corsHost;
module.exports.corsPort = corsPort;