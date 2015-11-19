#!/usr/bin/env node

exports.command = {
  description: "Manage import jobs",
  arguments: "<action>"
}

if (require.main === module) {

  var api = require('../lib/load_api.js');
  require('../lib/utils.js');
  var respond = require('../lib/respond.js');

  var JobRunner = require('../lib/job-runner.js');

  var prompt = require('prompt');
  var argv = require('minimist')(process.argv.slice(2));
  var Table = require('cli-table2');
  var fs = require('fs');



  switch(argv._.shift()) {

  case 'create':

    if (!argv['dir'] || !argv['import-type']) {
      console.log("Usage: as-cli jobs create --dir <DIR> --import-type <IMPORTER KEY>");
      return;
    }


    var runner = new JobRunner({
      dir: argv['dir'],
      import_type: argv['import-type'],
      batch_size: typeof(argv['batch-size']) === 'number' ? argv['batch-size'] : 10,
    }).api(api);

    runner.run(function(results) {
      var table = new Table({
        head: ['Job ID', 'Status', 'Files', 'Message'],
        colWidths: [10, 10, 20, 65]
      });

      for (var i=0; i < Object.keys(results).length; i++) {
        var id = Object.keys(results)[i];
        var msg = results[id].msg ? results[id].msg.wrap(60) : "No information available"
        table.push([id, results[id].status, results[id].filenames.join("\n"), msg]);
      }

      console.log(table.toString());

      prompt.get([{
        description: 'Save results as',
        name: 'results_file',
        type: 'string',
      default: 'results.txt',
        required: false,
      }], function(err, result) {
        if (result.results_file) {
          fs.writeFile(result.results_file, table.toString(), function(err) {
            if (err) {
              respond.error("Error saving results: %s", err);
            } else {
              respond.success("Saved results");
            }
          });
        }
      });

    });

    break;

  default:

    api.getJobs({
      page: 1,
    }, function(err, json) {
      if (err) {
        respond.error(err);
      } else {
        respond.success(json);
      }
    });

  }
}
