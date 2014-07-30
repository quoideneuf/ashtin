#!/usr/bin/env node

var config = require('./config.js');

var Api = require('asapi');

var api = new Api({url: config.backend_url, 
                   session: config.session,
                   active_repo: config.active_repo
                  });

module.exports = api;

