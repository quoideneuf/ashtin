var logger = require('./logger.js');
var config = require('./config.js');

var fs = require('fs');
var path = require('path');
var FormData = require('form-data');
var JobWatcher = require('./job-watcher.js');


var JobRunner = function(opts) {
  this.import_type = opts.import_type;
  this.dir = opts.dir;
  this.batch_size = opts.batch_size;

  var _api;

  this.api = function(api) {
    _api = api;
    return this;
  };


  var report_result = function (result) {
    var out = result.file + ": " + result.status + " (job #" + result.job_id + ")";
    if (result.status == 'imported') {
      out = out.green;
    } else {
      out = out.red;
    }

    console.log(out);

  }

  var jobCounter = 0;


  
  this.run = function(callback) {
    var that = this;

    var jobResults = {};


    var cb = function() {
      if (jobCounter == 0) {
        callback(jobResults);
      }
    };


    this.each_job(function(job) {
      cb(jobCounter++);

      _api.createJob(job, function(err, json) {
        if (err) throw(err);

        var watcher = new JobWatcher(json).api(_api);

        watcher.once('completed', function(job_id, result) {
          jobResults[job_id] = result;

          result.filenames.each(function(filename) {
            report_result({
              file: filename,
              status: 'imported',
              job_id: job_id,
            });
          });

          cb(jobCounter--);
        });

        watcher.once('failed', function(job_id, result) {
          var msg;

          jobResults[job_id] = result;

          _api.getJobError(job_id, function(err, importError) {
            if (err) {
              msg = "Error retrieving failed job log -> " + err;
            } else {
              msg = importError;
              console.log("Job #" + job_id + " -> " + msg);
            }
            jobResults[job_id].msg = msg;
            cb(jobCounter--);
          });

          for (var i = 0; i < result.filenames.length; i++) {
            report_result({
              file: result.filenames[i],
              status: 'failed',
              job_id: job_id
            });
          }
        });

        watcher.start();

      });
    });
  };


  var recordPath = path.join(this.dir, '.asstate');
  if (fs.existsSync(recordPath)) fs.unlink(recordPath);
  logStream = fs.createWriteStream(recordPath, {flags:'w'});

  this.record_result = function (filename, result) {
    logStream.write(filename + ":" + JSON.stringify(result) + "\n");
  }

  this.each_job = function(callback) {
    var $this = this;

    this.each_batch(function(batch) {
      var job = {
        import_type: $this.import_type,
        filenames: batch,
        files: batch.map(function(file) {
          return path.join($this.dir, file);
        })
      };

      callback(job);
    });
  };
                            

  this.each_batch = function(callback) {
    var $this = this;

    fs.readdir(opts.dir, function(err, files) {
      if (err) throw err;

      var batch = [];

      files.forEach(function(file) {        
        if (file.match(/^\./)) return;

        batch.push(file);
        if (batch.length == $this.batch_size) {
          callback(batch);
          batch = [];
        }
      });

      if (batch.length) {
        callback(batch);
      }

    });
  };

  this.print = function() {
    console.log("PRINT");
    var i = 0;
    this.each_batch(function(batch) {
      console.log("Batch " + i + ": " + batch.join(', '));
      i += 1;
    });
  }
}

module.exports = JobRunner;
  
