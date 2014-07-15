#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
var App = require(lib + '/app.js')['App'];

new App().run();

