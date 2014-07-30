#!/usr/bin/env node

exports.command = {
  description: "Manage repository records and set active repository",
  arguments: "<action>"
}

if (require.main === module) {

  require('../lib/utils.js');
  var api = require('../lib/load_api.js');

  var config = require('../lib/config.js');
  var prompt = require('prompt');
  var argv = require('minimist')(process.argv.slice(2));
  var Table = require('cli-table');

  switch(argv._.shift()) {

  case 'create':

    var repo = {
      repo_code: argv['repo-code'],
      name: argv['name']
    };

    api.createRepository(repo, function(err, json) {
      if (err) {
        console.log("Error: " + JSON.stringify(err));
      } else {
        console.log("Created: " + json.uri);
      }
    });

    break;

  default:

    api.getRepositories(function(err, repos) {
      var table = new Table({
        head: ['ID', 'URL', 'Name', 'Description'],
        colWidths: [10, 20, 20, 40]
      });
      
      repos.each(function(repo) {
        repo_id = repo.uri.match(/\/(\d+)$/)[1];
        if (repo_id == config.active_repo.toString()) {
          repo_id += " *";
        }
        var row = [repo_id, repo.uri, repo.name, repo.description];
        row.replace_undefined("(none)");
        table.push(row);
      });

      console.log(table.toString());

      prompt.get([{
        description: 'Select working repository',
        name: 'active_repo',
        type: 'number',
        required: false,
      }], function (err, result) {
        if (result.active_repo) {
          config.active_repo = result.active_repo;
          config.save();
        }
      });
    });
  }
}
