var EventEmitter = require('events').EventEmitter;
var util = require('util');

var JobWatcher = function(job) {
  var that = this;
  var job_id = job.id;

  var _api;

  this.api = function(api) {
    _api = api;
    return this;
  };

  this.job = job;
  EventEmitter.call(this);

  this.start = function() {
    _api.get(job.uri, function(err, json) {

      if (json.status == 'completed') {
        finished = true;
        that.emit('completed', job_id, json);
      } else if (json.status == 'failed') {
        finished = true;
        that.emit('failed', job_id, json);
      } else {
        setTimeout(function() {
          that.start();
        }, 1000);
      }
    });
  };
}

util.inherits(JobWatcher, EventEmitter);

module.exports = JobWatcher;
