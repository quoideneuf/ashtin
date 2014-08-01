#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

var Queue = function() {
  var that = this;
  var q = [];
  var throttle = 0;

  this.tickDown = function() {
    if(throttle > 0) {
      throttle -= 1;
    }
  }

  this.push = function(callback) {
    q.push(callback);
  }

  this.start = function() {
    if (q.length > 0 && throttle < 10) {
      q.pop()();
      throttle += 1;
    }
    setTimeout(function() {
      console.log("Throttle " + throttle + " - Size " + q.length);
      that.start();
    }, 2000);
  }

}

module.exports = function(api) {

  var dir = argv['dir']
  var exists = fs.existsSync(dir);

  if(!exists) {
    throw("Output directory does not exist");   
  }

  var q = new Queue();
  q.start()
  
  api.eachResource(function(resource) {

    q.push(function() {
      
      console.log("Download EAD for " + resource.title);

      var id = resource.uri.replace(/.*\//, '')

      var ead_uri = "/repositories/:repo_id/resource_descriptions/" + id + ".xml?include_daos=true&include_unpublished=true&numbered_cs=false";

      var outpath = path.join(dir, id + ".xml");
      var ws = fs.createWriteStream(outpath);

      ws.on('finish', function() {
        console.log("finish");
        q.tickDown();
      });

      api.download(ead_uri, ws);
    });
  });
}
