#!/usr/bin/env node

exports.command = {
  description: "export all EADs from a repository into a directory"
}

if (require.main === module) {
  require('../lib/utils.js');
  var api = require('../lib/load_api.js');

  var argv = require('minimist')(process.argv.slice(2));
  var fs = require('fs');
  var path = require('path');

  var Queue = function() {
    var that = this;
    var q = [];
    var throttle = 0;
    var keepalive = 10;
    var done = 0;

    this.kill = function() {
      keepalive = 0;
    }

    this.tickDown = function() {
      if(throttle > 0) {
        throttle -= 1;
      }
      done += 1;
    }

    this.push = function(callback) {
      q.push(callback);
    }

    this.start = function() {
      if (q.length > 0 && throttle < 10) {
        q.pop()();
        throttle += 1;
      }

      if (throttle === 0 && q.length === 0) keepalive--;

      setTimeout(function() {
        if (keepalive > 0) {
          console.log("Active " + throttle + " - Queued " + q.length + " - Completed " + done);
          that.start();
        }
      }, 1000);
    }
  }


  function printUsage() {
    console.log("Usage: ascli batch-export --dir <directory>");
  }

  if (!argv['dir'] ) {
    printUsage();
    process.exit(1);
  }

  var dir = argv['dir'];
  var exists = fs.existsSync(dir);


  if(!exists) {
    console.log("Output directory not found. Make sure to use option --dir");
    printUsage();
    process.exit(1);
  }

  var q = new Queue();

  api.on('serverError', function(code) {
    q.kill();
  });


  q.start()
  
  api.eachResource(function(err, resource) {
    q.push(function() {
      
      console.log("Download EAD for " + resource.title);

      var id = resource.uri.replace(/.*\//, '');
      var ead_id = resource.ead_id || id;

      var ead_uri = "/repositories/:repo_id/resource_descriptions/" + id + ".xml?include_daos=true&include_unpublished=true&numbered_cs=true";

      var outpath = path.join(dir, ead_id + ".xml");
      var ws = fs.createWriteStream(outpath);

      ws.on('finish', function() {
        q.tickDown();
      });
      
      api.download(ead_uri, ws);
    });
  });
}
