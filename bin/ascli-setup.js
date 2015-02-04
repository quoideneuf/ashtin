#!/usr/bin/env node

var Api = require('asapi');
var config = require('../lib/config.js');
var respond = require('../lib/respond.js');


var prompt = require('prompt');

exports.command = {
  description: "Log in to ArchivesSpace and store your session key"
}


if (require.main === module) {

  prompt.get([{
    description: 'ArchivesSpace Backend URL',
    name: 'backend_url',
    pattern: /^(http|\d{4})/,
    type: 'string',
    required: true,
  default: config.backend_url,
  }, {
    name: 'user',
    description: 'Your username',
    type: 'string',
    required: true,
  default: 'admin',
  }, {
    name: 'password',
    hidden: true,
  }], function(err, result) {
    backend_url = result.backend_url.match(/^\d{4}$/) ? "http://localhost:" + result.backend_url : result.backend_url;
    api = new Api({url:backend_url});
    api.login(result, function(err, session) {
      if (err) {
        respond.error(err);
      } else {
        config.backend_url = backend_url;
        config.session = session;
        config.save();
        respond.success("You are logged in!");
      }
    });
  });
}
