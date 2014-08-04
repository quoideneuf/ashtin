var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'info' }),
    new (winston.transports.File)({ level: 'debug', filename: 'as-cli.out'} )
  ]
});

module.exports = logger;
