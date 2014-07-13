require('./utils.js');
var fs = require('fs');
var path = require('path');

var prompt = require('prompt');
var argv = require('minimist')(process.argv.slice(2));

var Table = require('cli-table');

var logger = require('./logger.js');
var config = require('./config.js');

var Api = require('asapi');
var api = new Api({url: config.backend_url, 
                   session: config.session,
                   active_repo: config.active_repo
                  });


var JobRunner = require('./job-runner.js');
var Task = require('./task.js');

var DigitalObject = require('../records/digital_object.js');


var tasks = [
  new Task('session', function() {
    console.log("Session: " + config.session);
  }),

  new Task('setup', function() {
    prompt.get([{
      description: 'ArchivesSpace Backend URL',
      name: 'backend_url',
      pattern: /^http/,
      type: 'string',
      required: true,
      default: config.backend_url,
    }, {
      name: 'user',
      description: 'Your username',
      type: 'string',
      required: true,
      default: 'admin',
    }, {
      name: 'password',
      hidden: true,
    }], function(err, result) {
      api = new Api({url:result.backend_url});
      api.login(result, function(err, session) {
        if (err) {
          respond_error(err);
        } else {
          config.backend_url = result.backend_url;
          config.session = session;
          config.save();
          respond_success("You are logged in");
        }
      });
    });
  }),

  new Task('import', function(argv) {

    console.dir(argv);
  }).flags({
    source: {
      required: true,
      boolean: false
    },
    transformer: {
      required: true,
      boolean: false
    }
  }),


  new Task('jobs', function(argv) {

    switch(argv._.shift()) {

    case 'create':

      var runner = new JobRunner({
        dir: argv['dir'],
        import_type: argv['import-type'],
        batch_size: typeof(argv['batch-size']) === 'number' ? argv['batch-size'] : 10,
      }).api(api);

      runner.run(function(results) {
        var table = new Table({
          head: ['Job ID', 'Status', 'Files', 'Message'],
          colWidths: [10, 10, 20, 65]
        });

        Object.keys(results).each(function(id) {
          var msg = results[id].msg ? results[id].msg.wrap(60) : "No information available"
          table.push([id, results[id].status, results[id].filenames.join("\n"), msg]);
        });

        console.log(table.toString());

        prompt.get([{
          description: 'Save results as',
          name: 'results_file',
          type: 'string',
          default: 'results.txt',
          required: false,
        }], function(err, result) {
          if (result.results_file) {
            fs.writeFile(result.results_file, table.toString(), function(err) {
              if (err) {
                logger.warn("Error saving results: %s", err);
              } else {
                logger.debug("Saved results");
              }
            });
          }
        });

      });


      break;

    default:

      api.getJobs({
        page: 1,
      }, function(err, json) {
        console.log(err);
        console.log(json);
      });

    }
  }).actions({
    create: {
      flags: [
        {
          flag: 'dir',
          required: true,
          boolean: false
        },
        {
         flag: 'import-type',
         required: true,
         boolean: false
        }          
      ]
    }
  }),

  new Task('files', function() {

    switch(argv._.shift()) {

    case 'register':

      var dir = argv['dir'];

      if (!dir.match(/^\//)) {
        dir = path.resolve(process.cwd(), dir);
      }

      var file_uri_base_default = "file://" + dir;

      console.log(dir);

      prompt.get([{
        description: 'File URI base',
        name: 'file_uri_base',
        type: 'string',
        default: file_uri_base_default
      }], function(err, result) {
        fs.readdir(dir, function(err, files) {
          files.forEach(function(file) {
            if (file.match(/^\./)) return;

            var filedata = {
              uri: result.file_uri_base + "/" + file,
              filename: file,
              bytesize: fs.statSync(path.join(dir, file)).size
            };

            logger.debug(filedata);
            api.createDigitalObject(new DigitalObject(filedata), function(err, json) {
              if (err) {
                console.log("Error: " + JSON.stringify(err));
              } else {
                console.log("Created: " + json.uri);
              }

            });
          });
        });
      });
          
      break;

    };
  }).actions({
    register: {
      flags: [
        {
          flag: 'dir',
          required: true,
          boolean: false
        }
      ]
    }
  }),


  new Task('repositories', function() {

    switch(argv._.shift()) {

    case 'create':

      var repo = {
        repo_code: argv['repo-code'],
        name: argv['name']
      };

      api.createRepository(repo, function(err, json) {
        if (err) {
          console.log("Error: " + JSON.stringify(err));
        } else {
          console.log("Created: " + json.uri);
        }
      });

      break;

    default:

      api.getRepositories(function(err, repos) {
        var table = new Table({
          head: ['ID', 'URL', 'Name', 'Description'],
        colWidths: [10, 20, 20, 40]
        });

        repos.each(function(repo) {
          repo_id = repo.uri.match(/\/(\d+)$/)[1];
          if (repo_id == config.active_repo.toString()) {
            repo_id += " *";
          }
          var row = [repo_id, repo.uri, repo.name, repo.description];
          row.replace_undefined("(none)");
          logger.debug(row);
          table.push(row);
        });

        console.log(table.toString());

        prompt.get([{
          description: 'Select working repository',
          name: 'active_repo',
          type: 'number',
          required: false,
        }], function (err, result) {
          if (result.active_repo) {
            config.active_repo = result.active_repo;
            config.save();
          }
        });
      });
    };
  }).actions({
    create: {
      flags: [
        {
          flag: 'repo-code',
          required: true,
          boolean: false
        },
        {
          flag: 'name',
          required: true,
          boolean: false
        }
      ]
    }
  })

];


function respond_success(message) {
  console.log(message.green);
}

function respond_error(message) {
  console.log(message.red);   
}

function helpful_exit() {
  console.log("Available tasks: " + tasks.map(function(task) {
    return task.name
  }).join(', '));
}


function App() {
  this.run = function() {
    logger.debug(argv);

    var command = argv._.shift();

    if (command === undefined) {
      helpful_exit();

    } else {
      tasks.each_with_index(function(task, i) {
        if (task.name == command) {
          try {
            task.start(argv);
          } catch(err) {
            respond_error(err);
          };
        } 
      });
    }
  };
}

module.exports = App;
