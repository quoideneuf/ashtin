var logger = require('./logger.js');
var pwuid = require('pwuid');
var fs = require('fs');
var configPath = pwuid().dir + '/.asconsole';


var Config = function(opts) {

  this.backend_url = opts.backend_url;
  this.session = opts.session;
  this.active_repo = opts.active_repo;

  this.save = function() {
    fs.writeFile(configPath, JSON.stringify(this), function(err) {
      if (err) {
        logger.warn("Error saving configuration: %s", err);
      } else {
        logger.debug("Saved config " + configPath);
      }
    });
  }
}

Config.load = function() {
  var params = {};
  
  if (fs.existsSync(configPath)) {
    var data = fs.readFileSync(configPath);
    params = JSON.parse(data);

  } else {
    params = {
      backend_url: "http://localhost:4567",
      session: null,
      active_repo: 2
    };
  }

  return new Config(params);
}

module.exports = Config.load();
