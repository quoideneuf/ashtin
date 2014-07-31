#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

module.exports = function(api) {

  var dir = argv['dir']
  var exists = fs.existsSync(dir);

  if(!exists) {
    throw("Output directory does not exist");   
  }

  api.eachResource(function(resource) {
    console.log("Download EAD for " + resource.title);

    var id = resource.uri.replace(/.*\//, '')

    var ead_uri = "/repositories/:repo_id/resource_descriptions/" + id + ".xml?include_daos=true&include_unpublished=true&numbered_cs=false";

    var outpath = path.join(dir, id + ".xml");
    var ws = fs.createWriteStream(outpath);

    api.download(ead_uri, ws);
  });
}
