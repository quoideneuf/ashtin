#!/usr/bin/env node

exports.command = {
  description: "Ping ArchivesSpace and display the current version"
}

if (require.main === module) {

  var api = require('../lib/load_api.js');
  var argv = require('minimist')(process.argv.slice(2));
  var _ = require('lodash');

  if (!argv['resource'] || typeof(argv['resource']) != 'object' || argv['resource'].length != 2 ) {
    console.log("Usage: ashtin merge-preflight --resource {ID1} --resource {ID2}");
  }


  var refSetOne = [];
  var refSetTwo = [];
  
  var requestCount = 0;
  var responseCount = 0;


 var logObject = function(treeNode, refSet) {
   requestCount++;
   api.get(treeNode.record_uri).then(function(archivalObjectRecord) {
     refSet.push(archivalObjectRecord.ref_id);
     responseCount++;
     if (treeNode.has_children) {
       _.each(treeNode.children, function(el, i) {
         logObject(el, refSet);
       });
     }

   }).catch(function(err) {
     console.log(err);
     responseCount++;
   });
};


  api.get('/repositories/:repo_id/resources/' + argv['resource'][0] + '/tree').then(function(json) {
    _.each(json.children, function(el, i) {
      logObject(el, refSetOne);
    });   
  }).catch(function(x) {console.log(x);});


  api.get('/repositories/:repo_id/resources/' + argv['resource'][1] + '/tree').then(function(json) {
    _.each(json.children, function(el, i) {
      logObject(el, refSetTwo);
    });   
  }).catch(function(x) {console.log(x);});


var watch = function() {
  setTimeout(function() {
    if (requestCount < 1 || (responseCount != requestCount)) {
      console.log("waiting");
      watch();
    } else {
      var intersection = _.intersection(refSetOne, refSetTwo);
      console.log(intersection);
    }
  }, 1000);
}

watch();



}
