#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');
var Table = require('cli-table');

var _ = require('lodash');
var generator = require('../lib/generator.js')

var RequestQueue = function(limit) {
  var limit = limit;
  var throttle = 0;
  var keepalive = true;
  var stack = [];

  var $this = this;

  this.kill = function() {
    keepalive = false;
  }

  this.tickDown = function() {
    if(throttle > 0) 
      throttle -= 1;
  }

  this.push = function(callback) {
    stack.push(callback);
  }

  this.start = function() {

    if (stack.length > 0 && throttle < limit) {
      stack.pop()();
      throttle += 1;
      $this.start();
    } else if ((throttle === limit || stack.length === 0) && keepalive) {
      setTimeout(function() { 
        console.log("Waiting -- stack length: " + stack.length.toString() + ", throttle: " + throttle.toString() + ", limit: " + limit.toString());
        $this.start()
      }, 1000);
    } else if (keepalive) {
      $this.start();
    }
  }
}


module.exports = function(api) {

  var size = argv['size']
  var countDown = size;
  var resourceUri;
  var rq = new RequestQueue(30);
  var done = false;

  if(!size) {
    console.log("No ID given. Use the --size option with an integer");
    return;
  }

  if(typeof(size) != 'number' || size > 10000) {
    console.log("Size must be a number between 1 and 10000")
  }

  function getOpts(opts) {
    var opts = opts || {};
    var summary = ["a box of foos", "a box of bars", "a box of cars"][_.random(0, 2)];

    return _.merge({
      resource: {ref: resourceUri},
      extents: [generator.extent({container_summary: summary})]
    }, opts);
  }

  function createNode(parentUri) {
    var opts = {}

    if (size > 0) {

      console.log("create node under " + parentUri)

      if (parentUri) {
        opts.parent = {ref: parentUri}
      }
      size = size - 1;

      rq.push(function() {
        api.createArchivalObject(generator.archival_object(getOpts(opts))).
          then(function(archivalObject) {
            rq.tickDown();
            countDown -= 1;
            console.log(archivalObject.uri);
            if (size > 0) {
              _.times(_.random(0, 100), function() {
                setTimeout(function() {
                  createNode(archivalObject.uri);
                }, _.random(100, 500));
              });
            }
            if (countDown < 1) {
              rq.kill();
              console.log("Done making tree: " + resourceUri);
            }
          }).
          catch(function(err) {
            throw err;
          });
      });
    }
  }

  rq.push(function() {
    api.createResource(generator.resource()).then(function(resource) {
      resourceUri = resource.uri
      console.log(resource.uri)
      _.times(_.random(1, 10), function() {
        createNode();
      });
    });
  });

  rq.start();

}


