Array.prototype.each = function(callback) {
  for (var i=0; i < this.length; i++) { callback(this[i]); } 
}

Array.prototype.each_with_index = function(callback) {
  for (var i=0; i < this.length; i++) { callback(this[i], i); } 
}


Array.prototype.replace_undefined = function(replacement) {
  var _this = this;
  this.each_with_index(function(el, i) {
    if (el === undefined) {
      _this[i] = replacement;
    }
  });
}


// thanks: http://james.padolsey.com/javascript/wordwrap-for-javascript/
String.prototype.wrap = function (width, brk, cut ) {

    brk = brk || '\n';
    width = width || 75;
    cut = cut || false;
 
    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
 
    return this.match( RegExp(regex, 'g') ).join( brk );
}
