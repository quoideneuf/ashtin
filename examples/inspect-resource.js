#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');
var Table = require('cli-table2');

module.exports = function(api) {

  var id = argv['id']

  if(!id) {
    console.log("No ID given. Use the --id option");
    return;
  }

  var table = new Table({
    head: ['Property', 'Value'],
    colWidths: [30, 100],
    wordWrap: true
  });


  api.get("/repositories/:repo_id/resources/" + id, function(err, json) {
    if (err) {
      console.log(JSON.stringify(err));
      throw err;
    }

    for (var i=0; i < Object.keys(json).length; i++) {
      var p = Object.keys(json)[i];
      var val = "";

      if (typeof(json[p]) === 'object' && json[p].length) {
        json[p].each(function(el) {
          val += JSON.stringify(el, null, 2) + ",\n";
        });
      } else {
        val = JSON.stringify(json[p], null, 2);
      }


      if (typeof(val) != 'string') {
        val = JSON.stringify(val, null, 2);
      }

      val = val.replace(/,"/, ', "')
      val = val.replace(/,{/, ', {')

      table.push([p, val]);
    }

    console.log(table.toString());
  });
}
