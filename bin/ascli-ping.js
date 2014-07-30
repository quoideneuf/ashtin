#!/usr/bin/env node

exports.command = {
  description: "Ping ArchivesSpace and display the current version"
}

if (require.main === module) {

  var api = require('../lib/load_api.js');

  api.ping(function(err, body) {
    console.log("ArchivesSpace Version: " + body.archivesSpaceVersion);
  });
}
