var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({}),
    new (winston.transports.File)({ level: 'debug', filename: 'asconsolelog.txt'} )
  ]
});

module.exports = logger;
