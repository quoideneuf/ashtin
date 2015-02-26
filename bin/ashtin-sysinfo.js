#!/usr/bin/env node

exports.command = {
  description: "Get diagnostic system information for ArchivesSpace"
}

if (require.main === module) {

  var api = require('../lib/load_api.js');

  api.get("/system/info", {}, function(err, body) {
    console.log(body);
  });
}
