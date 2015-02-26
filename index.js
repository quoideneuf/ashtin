
var helmsman = require('helmsman');

var opts = {
  localDir: __dirname + "/bin",
  prefix: "ashtin"
}

var cli = helmsman(opts);

cli.parse();
