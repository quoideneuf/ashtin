#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var root = path.join(path.dirname(fs.realpathSync(__filename)), '../');

require(path.join(root, "index.js"));

