import winston from "winston";
import { PROD_ENVIRONMENT } from "../constants";

const environment = process.env.ENVIRONMENT ?? "dev";
const isProd = PROD_ENVIRONMENT.includes(environment!);
const level = () => {
    return isProd ? "info" : "debug";
};

const defaultFormat = [
    winston.format.splat(),
    winston.format.simple(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.metadata({ fillExcept: ["timestamp", "level", "label", "message"] }),
    winston.format.printf((log) => {
        const { timestamp, level, message, stack } = log;
        const stackMessage = stack ? `\n${stack}` : "";
        return `${timestamp} [${level}]: ${message} ${stackMessage}`;
    }),
];
const fileFormat = winston.format.combine(...defaultFormat);

const consoleFormat = winston.format.combine(winston.format.colorize({ all: true }), ...defaultFormat);

const transports = [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({ filename: "logs/error.log", level: "error", format: fileFormat }),
    new winston.transports.File({ filename: "logs/app.log", format: fileFormat }),
];

const exceptionHandlers = [new winston.transports.File({ filename: "logs/exceptions.log", format: fileFormat })];

const options: winston.LoggerOptions = {
    level: level(),
    transports: transports,
    exceptionHandlers: exceptionHandlers,

};

const logger = winston.createLogger(options);

if (!isProd) {
    logger.debug("Logging initialized at debug level");
}

export default logger;
