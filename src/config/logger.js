const { includes } = require('lodash');
const { createLogger, config, format } = winston;
const { colorize, combine, label, printf } = format;

const customFormat = printf((info) => `[${info.label}] ${info.message}`);

const transports = {
  console: '',
};

const logger = createLogger({
  levels: config.npm.levels,
  format: combine(
    colorize({ all: true }),
    label({ label: 'WeTransfer SDK' }),
    customFormat
  ),
  transports: [transports.console],
});



function setLoggerLevel(level = 'info') {
  if (!includes(Object.keys(config.npm.levels), level)) {
    return logger.warn(`"${level}" is not a valid logger level. Please specify one of the following levels: [
      'error',
      'warning',
      'info',
      'verbose,'
      'debug',
      'silly'
    ]`);
  }

  transports.console.level = level;
}

module.exports = logger;
module.exports.setLoggerLevel = setLoggerLevel;
