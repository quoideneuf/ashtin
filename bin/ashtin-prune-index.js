#!/usr/bin/env node

exports.command = {
  description: "Check that indexed records actually exist and delete them if they don't"
}

if (require.main === module) {

  require('../lib/utils.js');
  var api = require('../lib/load_api.js');
  var config = require('../lib/config.js');
  var request = require('request');


  function eachIndexedResource(currentPage, callback) {
    api.get('/search?type[]=resource&page='+currentPage).then(function(results) {
      results.results.each(callback);
      if(currentPage < results.last_page) {
        eachIndexedResource(currentPage+1, callback);
      }
    }).catch(function(err) {
      console.log(err);
    });
  }

  var commitTimeout = null

  var commitFunc = function() {
    request.post({
      url: "http://localhost:2999/update",
      json: {
        commit: {
          softCommit: false
        }
      }
    });
  }

  eachIndexedResource(1, function(doc) {
    api.get(doc.uri).then(function(ok) {
      console.log(doc.uri+" exists");
    }).catch(function(err) {
      if (err.code === 404) {
        console.log(doc.uri+" 404: deleting from index");

        var solrRequest = {
          'delete': {
            'id': doc.uri
          }
        }

        request.post({
          url: "http://localhost:2999/update",
          json: solrRequest
        }, function(err, res, body) {
          if(!err) {
            if(commitTimeout) { clearTimeout(commitTimeout); }
            commitTimeout = setTimeout(commitFunc, 100);          
          } else {
            console.log(err);
          }
        });
      }
    });
  });
}
  
