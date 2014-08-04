#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');
var Table = require('cli-table');

module.exports = function(api) {

  var id = argv['id']

  if(!id) {
    console.log("No ID given. Use the --id option");
    return;
  }

  var table = new Table({
    head: ['Property', 'Value'],
    colWidths: [30, 100]
  });


  api.get("/repositories/:repo_id/resources/" + id, function(err, json) {
    if (err) throw err;

    for (var i=0; i < Object.keys(json).length; i++) {
      var p = Object.keys(json)[i];
      var v = JSON.stringify(json[p]);

      if (typeof(v) != 'string') {
        v = JSON.stringify(v);
      }

      table.push([p, v]);
    }

    console.log(table.toString());
  });
}
