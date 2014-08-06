
var helmsman = require('helmsman');

var opts = {
  localDir: __dirname + "/bin",
  prefix: "ascli"
}

var cli = helmsman(opts);

cli.parse();
