const winston = require('winston');
const morgan = require('morgan');

const fs = require('fs');
const LOGS_FOLDER = process.env.LOGS_FOLDER || './logs';
if (!fs.existsSync(LOGS_FOLDER)) {
  fs.mkdirSync(LOGS_FOLDER);
}

winston.level = process.env.LOG_LEVEL || 'info';

const logFormat = winston.format.printf(info => {
  if (!info.timestamp) info.timestamp = new Date().toISOString();
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

let transports = [
  new winston.transports.File({
    filename: `${LOGS_FOLDER}/prism.log`,
    format: logFormat,
    handleExceptions: true,
    maxsize: 2 ** 20 * 10,
    maxFiles: 10
  })
];
if (process.env.NODE_ENV !== 'production')
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      handleExceptions: true
    })
  );

winston.configure({
  exitOnError: false,
  transports
});

const requestLogFormat = winston.format.printf(info => {
  return `${info.message}`;
});

const requestLogger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: `${LOGS_FOLDER}/prism-requests.log`,
      format: requestLogFormat,
      maxsize: 2 ** 20 * 10,
      maxFiles: 10
    })
  ]
});

requestLogger.infoStream = {
  write: function(message) {
    requestLogger.info(message);
  }
};

module.exports = {
  winston,
  morgan: morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: requestLogger.infoStream
  })
};
