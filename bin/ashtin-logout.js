#!/usr/bin/env node

var Api = require('asapi');
var config = require('../lib/config.js');
var respond = require('../lib/respond.js');


var prompt = require('prompt');

exports.command = {
  description: "Logout of ArchivesSpace and invalidate your session key"
}


if (require.main === module) {

  if (config.session) {
    var api = require('../lib/load_api.js');
    api.post('/logout').then(function(status) {
      console.log("Logged out: " + JSON.stringify(status));
    }).catch(function(err) {
      console.log("Error: " + JSON.stringify(err));
    });
  } else {
    console.log("No session to logout!");
  }

}
