var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'debug' }),
    new (winston.transports.File)({ level: 'debug', filename: 'as_cli.txt'} )
  ]
});

module.exports = logger;
