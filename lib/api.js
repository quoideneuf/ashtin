var logger = require('./logger.js');
var config = require('./config.js');

var fs = require('fs');
var path = require('path');

var request = require('request');
var FormData = require('form-data');

function Api() {
  this.login = function(opts, callback) {

    var form = {form: {password: opts.password}};

    request.post(opts.backend_url + "/users/" + opts.user + "/login", form, function(err, response, body) {
      if (response.statusCode == 403) {
        var err = "Unauthorized";
      }

      json = JSON.parse(body);
      callback(err, json.session);
    });
  };


  this.get = function(uri, callback) {
    doGet(uri, callback);
  }


  this.getJobs = function(opts, callback) {
    doGet("/repositories/:repo_id/jobs?page=" + opts.page, function(err, json) {
      callback(err, json);
    });
  };


  this.getJobError = function(job_id, callback) {
    doGetRaw("/repositories/:repo_id/jobs/" + job_id + "/log", function(err, res, body) {
      if (res.statusCode == 200) {
        var importError = parseError(body);
        callback(null, importError);
      }
    });
  };


  this.getRepositories = function(callback) {
    doGet("/repositories", function(err, json) {
      callback(err, json);
    });
  };


  this.createJob = function(job, callback) {
    var form = new FormData();
    form.append('job', JSON.stringify(job));
    job.files.each_with_index(function(filepath, i) {
      form.append('files[' + i + ']', fs.createReadStream(filepath));
    });

    doPostForm("/repositories/:repo_id/jobs", form, function(err, json) {
      if (!err && json.status != 'Created') {
        err = "Job Status error: " + json.status;
      }
      callback(err, json);
    });
  };


  this.createRepository = function(obj, callback) {
    doPost("/repositories", obj, function(err, json) {
      callback(err, json);
    });
  };


  this.createDigitalObject = function(obj, callback) {
    doPost("/repositories/:repo_id/digital_objects", obj, function(err, json) {
      callback(err, json);
    });
  };
}


function doGetRaw(uri, callback) {
  if (config.active_repo) {
    uri = uri.replace(":repo_id", config.active_repo);
  }

  var opts = {
    url: config.backend_url + uri,
    headers: {
      'X-ArchivesSpace-Session': config.session
    }
  };

  request(opts, function(err, res, body) {
    logger.debug("ASpace Response: " + res.statusCode + " : " + body);
    callback(err, res, body);
  });

};

// get JSON
function doGet(uri, callback) {

  var json;

  doGetRaw(uri, function(err, res, body) {
    if (res.statusCode == 200) {
      json = JSON.parse(body);
    }
    callback(err, json);
  });
};


function doPost(path, obj, callback) {
  if (config.active_repo) {
    path = path.replace(":repo_id", config.active_repo);
  }

  var opts = {
    url: config.backend_url + path,
    headers: {
      'X-ArchivesSpace-Session': config.session
    },
    json: obj
  };

  request.post(opts, function(err, res, body) {

    logger.debug("ASpace Response: " + res.statusCode + " : " + body);

    if (!err && res.statusCode == 400 && body.error) {
      err = body.error;
    }
    
    callback(err, body);

  });

};


function doPostForm(path, form, callback) {
  
  if (config.active_repo) {
    path = path.replace(":repo_id", config.active_repo);
  }

  var opts = {
    url: config.backend_url + path,
    headers: {
      'X-ArchivesSpace-Session': config.session
    }
  };

  form.getLength(function(err, length) {
    if (err) throw err;

    var r = request.post(opts, function(err, res, body) {
      logger.debug("ASpace Response: " + res.statusCode + " : " + body);

      json = JSON.parse(body);
      callback(err, json);
    });

    r._form = form;
    r.setHeader('content-length', length);
  });

}


function parseError(body) {

  var results = [];
  var loginfo = body.split(/=+\n/).map(function(s) { return s.replace(/\\n/g, ''); });

  while (loginfo[0].length < 1 && loginfo.length > 0) {
    loginfo.shift();
  }

  while (loginfo.length > 1) {
    var filename = loginfo.shift();
    var match = loginfo.shift().match(/Error:.*/);
 
    if (match) {
      results.push(filename + " -> " + match[0]);
    } else {
      results.push(filename + " (appears ok)");
    }
  }

  return results.join("\n");

};

module.exports = new Api();
