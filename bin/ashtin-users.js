#!/usr/bin/env node

exports.command = {
  description: "Manage user records",
  arguments: "<action>"
}

if (require.main === module) {

  require('../lib/utils.js');
  var api = require('../lib/load_api.js');

  var config = require('../lib/config.js');
  var argv = require('minimist')(process.argv.slice(2));

  switch(argv._.shift()) {

  case 'create':
    if(!argv['username'] || !argv['name'] || !argv['password']) {
      console.log("Usage: ashtin users create --username={username} --name='{name}' --password={password} [--admin]");
      return;
    }

    var admin;
    var password = argv['password'];

    if(argv['admin']) {
      admin = true;
    } else {
      admin = false;
    }

    var user = {
      username: argv['username'],
      name: argv['name'],
      is_admin: admin
    };

    api.createUser(user, password, function(err, json) {
      if (err) {
        console.log("Error: " + JSON.stringify(err));
      } else {
        console.log("Created: " + json.uri);
      }
    });

    break;
  case 'delete':
    if(!argv['usernames']) {
      console.log("Usage: ashtin users delete --usernames={usernames}");
      return;
    }

    var usernames = argv['usernames'].split(',');

    api.eachUser(function(err, user) {
      if(usernames.indexOf(user.username) > -1) {
        api.del(user.uri, function(err, body) {
          if (err) {
            console.log("Error: " + JSON.stringify(err));
          } else {
            console.log(body);
          }
        });
      }
    });

    break;
  case 'password-reset':
    if(!argv['username'] || !argv['password']) {
      console.log("Usage: ashtin users password-reset --username={username} --password={password}");
      return;
    }

    var username = argv['username'];
    var password = argv['password'];

    api.eachUser(function(err, user) {
      if(username == user.username) {
        api.updatePassword(user, password, function(err, json) {
          if (err) {
            console.log("Error: " + JSON.stringify(err));
          } else {
            console.log("Updated: " + json.uri);
          }
        });
      }
    });

    break;
  default:
    api.eachUser(function(err, user) {
      console.log([user.username, user.name].join(','));
    });

    return;
  }
}