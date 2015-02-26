#!/usr/bin/env node

exports.command = {
  description: "Delete everything in the database (requires ASpace Eraser)"
}

if (require.main === module) {

  var api = require('../lib/load_api.js');
  var respond = require('../lib/respond.js');

  api.nuke(function(err, body) {
    if (err) {
      respond.error(err);
    } else {
      respond.success(body);
    }
  });
}
