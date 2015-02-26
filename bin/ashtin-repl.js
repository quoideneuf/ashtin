#!/usr/bin/env node


exports.command = {
  description: "Load the ASpace API client and run a REPL",
}

if (require.main === module) {

  var winston = require('winston');

  var log = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: 'info',
        colorize: true,
        prettyPrint: true
      })
    ]});


  var _stack = []
  var push = function(x) {
    _stack.push(x);
    log.info("Added to stack");
  }

  var pop = function() {
    return _stack.pop();
  }


  require('../lib/utils.js');
  var api = require('../lib/load_api.js');
  var generator = require('../lib/generator.js')

  var repl = require('repl').start("> ");
  require('repl.history')(repl, process.env.HOME + '/.node_history');
  repl.context.api = api;
  repl.context.g = generator;
  repl.context.p = function(x) {
    log.info(x);
  };
  repl.context.push = push;
  repl.context.pop = pop;

  log.info("api - instance of the AS client");
  log.info('g - helper object for generating json');
  log.info('p - helper to inspect stuff');
  log.info('Example: api.createResource(g.resource()).then(p).catch(p)');
}
