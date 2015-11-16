#!/usr/bin/env node

// ashtin run-script examples/publish-everything.js

module.exports = function(api, generator) {

  if (!api.hasSession) {
    console.log("Please get logged in first: ascli setup");
    throw("Not logged in");
  }

  api.eachResource(function(err, json) {
    if(!json.publish) {
      json.publish = true;
      api.updateRecord(json).then(function(ok) {
        console.log("Published "+json.uri);
      }).catch(function(wtf) {
        console.log("FAILURE "+wtf.code+" "+wtf.message);
      });
    }
  });

};
