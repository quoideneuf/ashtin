#!/usr/bin/env node

exports.command = {
  description: "Load the ASpace api and pass it to a custom script.",
  arguments: "<path>"
}


if (require.main === module) {
  var path = require('path');

  var api = require('../lib/load_api.js');
  var argv = require('minimist')(process.argv.slice(2));

  if (argv._.length === 0) {
    console.log("Need a script path!");
    return;
  }

  var scriptPath = path.join(process.cwd(), argv._.shift());

  //todo - check that the file exists

  var scriptFunc = require(scriptPath);

  //todo - check that the script exports a single function

  scriptFunc(api);
}
