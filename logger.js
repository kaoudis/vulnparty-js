const { createLogger, format, transports } = require("winston");
const { combine, timestamp, prettyPrint } = format;

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

module.exports = logger;