#!/usr/bin/env node

// Dependency injection
module.exports = function(api, generator) {

  if (!api.hasSession) {
    console.log("Please get logged in first: ascli setup");
    throw("Not logged in");
  }

  api.createResource(generator.resource()).
    then(function(json) {
      console.log("Created: " + json.uri);
    }).
    catch(function(err) {
      console.log(":( " + err);
    });

};
