#!/usr/bin/env node

var config = require('./config.js');
var logger = require('./logger.js');
var Q = require('q');

var Api = require('asapi');

var api = new Api({url: config.backend_url,
                   session: config.session,
                   active_repo: config.active_repo,
                   logger: logger,
                   promiseFactory: function() {
                     var d = Q.defer();
                     return {
                       resolve: d.resolve,
                       reject: d.reject,
                       promise: d.promise
                     }
                   }
                  });

api.on('serverError', function(code) {
  switch(code) {
  case 412:
    console.log("Your session may have expired. Try running `ashtin setup`");
    break;
  case 403:
    console.log("Access denied. Try running `ashtin setup`");
    break;
  case 'ECONNREFUSED':
    console.log("Unable to connect to the server at " + config.backend_url);
    break;
  default:
   logger.debug("serverError " + code);
  }
});

module.exports = api;

