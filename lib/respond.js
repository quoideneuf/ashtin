
var Respond = function() {
  this.error = function(error) {
    console.log("Error: " + error);
  }

  this.success = function(message) {
    console.log(message);
  }
}

module.exports = new Respond();
