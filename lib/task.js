
var Task = function(name, body) {
  this.name = name;
  var body = body;
  var actions; // sub-tasks
  var flags;

  var validate = function(argv) {
    if (argv._[0] && actions) {
      if (!actions[argv._[0]]) {
        throw ("Could not find '" + argv._[0] + "' in [" + Object.keys(actions).map(function(a) { return "'" + a + "'" }).join(', ') + "]");
      }

      if (actions[argv._[0]].flags) {
        actions[argv._[0]].flags.each(function(flag) {
          if (flag.required && !argv[flag.flag]) {
            throw("Missing required parameter: " + flag.flag);
          }

          if (!flag.boolean && typeof(argv[flag.flag]) == 'boolean') {
            throw("Parameter " + flag.flag + " requires a value");
          }
        });
      }
    } else if (flags) {
      Object.keys(flags).each(function(flag) {
        if (flags[flag].required && !argv[flag]) {
          throw("Missing required parameter: " + flag);
        }

        if (!flags[flag].boolean && typeof(argv[flag]) == 'boolean') {
          throw("Parameter " + flag + " requires a value");
        }
      });
    }

  };


  this.start = function(argv) {
    validate(argv);
    body(argv);
  };

  this.actions = function(opts) {
    actions = opts;
    return this;
  }

  this.flags = function(opts) {
    flags = opts;
    return this;
  }

}

module.exports = Task;
