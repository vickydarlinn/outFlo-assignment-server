import winston from "winston";
import moment from "moment-timezone";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
    }),
    winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
      return `[${timestamp}] [${service}] ${level}: ${message} ${metaString}`;
    })
  ),
  transports: [
    new winston.transports.File({
      dirname: "logs",
      filename: "combined.log",
      level: "info",
      silent: process.env.NODE_ENV === "test",
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "error.log",
      level: "error",
      silent: process.env.NODE_ENV === "test",
    }),
    new winston.transports.Console({
      level: "debug",
      silent: process.env.NODE_ENV === "test",
    }),
  ],
});

export default logger;
