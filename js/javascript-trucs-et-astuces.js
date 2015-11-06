;(function() {

  // cf.
  // http://stackoverflow.com/questions/1199352/smart-way-to-shorten-long-strings-with-javascript
  if (typeof String.prototype.trunc !== 'function') {
    String.prototype.trunc = String.prototype.trunc || function(n) {
      return this.length > n ? this.substr(0, n - 1) + '…' : this;
    };
  }

  if (typeof String.prototype.cnurt !== 'function') {
    String.prototype.cnurt = String.prototype.cnurt || function(n) {
      return this.length > n ? '…' + this.substr(this.length - n) : this;
    };
  }

  if (typeof String.prototype.middleEllipse !== 'function') {
    String.prototype.middleEllipse = String.prototype.middleEllipse || function(m, n) {
      return this.length > (m + n) ? this.substr(0, m - 1) + '  …  ' + this.substr(this.length - n) : this;
    };
  }

  // cf.
  // http://stackoverflow.com/questions/498970/how-do-i-trim-a-string-in-javascript
  if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  // cf. http://stackoverflow.com/questions/280634/endswith-in-javascript
  if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
      if (typeof suffix === "undefined") {
        return false;
      }
      return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
  }

  // cf. http://stackoverflow.com/questions/646628/javascript-startswith
  if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function(prefix) {
      return this.slice(0, prefix.length) == prefix;
    };
  }

  // cf. https://gist.github.com/bgrins/5108712
  // Full version of `log` that:
  // * Prevents errors on console methods when no console present.
  // * Exposes a global 'log' function that preserves line numbering and
  // formatting.
  (function() {
    var method;
    var noop = function() {
    };
    var methods = [ 'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 
                    'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 
                    'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn' ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
      method = methods[length];

      // Only stub undefined methods.
      if (!console[method]) {
        console[method] = noop;
      }
    }

    if (Function.prototype.bind) {
      window.log = Function.prototype.bind.call(console.log, console);
    } else {
      window.log = function() {
        Function.prototype.apply.call(console.log, console, arguments);
      };
    }
  })();

}());
