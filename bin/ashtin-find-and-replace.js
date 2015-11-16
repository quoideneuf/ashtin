#!/usr/bin/env node

exports.command = {
  description: "Create a find and replace job and monitor it.",
  arguments: "<{args}>"
}

if (require.main === module) {
 var api = require('../lib/load_api.js');
 var argv = require('minimist')(process.argv.slice(2));
 var config = require('../lib/config.js');

  if(!config.active_repo) {
    console.log("Need an active repo! Run ashtin setup");
    return;
  }

  var repo_url = "/repositories/" + config.active_repo;
  var start_time = Date.now();
  var end_time, total_seconds;


  if(!argv['record-type'] || !argv['resource'] || !argv['property'] || !argv['find'] || !argv['replace']) {
    console.log("Usage: ashtin --resource {id} --record-type {type} --property {property} --find {find string or regexp} --replace {replace string}")
    return;
  }

  var job = {
    job_type: 'find_and_replace_job',
    job: {
      jsonmodel_type: 'find_and_replace_job',
      scope: {
        jsonmodel_type: argv['record-type'],
        base_record_uri: repo_url + "/resources/" + argv['resource'],
        property: argv['property']
      },
      arguments: {
        find: argv['find'],
        replace: argv['replace']
      }
    }
  }

  console.log(job);


  var watch = function(uri) {
    api.get(uri).
      then(function(job) {
        console.log(job.uri + ": " + job.status);

        if (job.status === "completed") {
          end_time = Date.now();
          total_seconds = (end_time - start_time) / 1000
          console.log("Job completed in " + total_seconds + " seconds.")
        }

        if (job.status != "completed" && job.status != "failed" && job.status != "canceled")
          setTimeout(function() {watch(uri)}, 1000);
      }).
      catch(function(err) {
        console.log("Error getting job " + err);

      }); 
  };


  api.post(repo_url + "/jobs", job).
    then(function(result) {
      console.log(result.uri);

      watch(result.uri);

    }).
    catch(function(err) {
      console.log("Error posting job " + err);
    });
         
}
