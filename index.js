// hath
var util = require('util');

var default_options = {
  title: function(text) { console.log(text + ':'); },
  pass: function(label, message) { /* by default, don't log passes, just count them */ },
  fail: function(label, message) { console.log('FAIL ' + label + ': ' + message); },
  summary: function(npass, nfail) {
    console.log('----');
    console.log('PASS: ' + npass);
    console.log('FAIL: ' + nfail);
    console.log(0===nfail ? 'TESTS PASS' : 'TESTS FAIL');
  },
  message: 'assert'
};

function Hath(options) {
  this.options = options || {};
  this.options.title = this.options.title || default_options.title;
  this.options.pass = this.options.pass || default_options.pass;
  this.options.fail = this.options.fail || default_options.fail;
  this.options.summary = this.options.summary || default_options.summary;
  this.options.message = this.options.message || default_options.message;
  this.npass = 0;
  this.nfail = 0;
  this.locals = {};
}

function assert(condition, message) {
  message = message || this.options.message;
  if (condition) {
    ++this.npass;
    this.options.pass(this.testlabel, message);
  } else {
    ++this.nfail;
    this.options.fail(this.testlabel, message);
  }
}
Hath.prototype.assert = assert;

function label(label) {
  this.testlabel = label;
}
Hath.prototype.label = label;

function sequence(t, steps, done) {
  var nsteps = steps.length;
  if (!nsteps) return done();

  var count = 0;
  var message;

  function dotest(test, complete) {
    setImmediate(function() {
        t.label(test.name);
        test(t, complete);
    });
  }

  function complete(err) {
    ++count;
    message = message || err;
    if (nsteps > count) {
      dotest(steps[count], complete);
    } else {
      done(message);
    }
  }

  dotest(steps[count], complete);
}

function run(title, steps, next) {
  var self = this;
  sequence(this, steps, function(err) {
    self.options.title(title, self.npass);
    if (next) {
      next(self.npass, self.nfail);
    } else {
      self.options.summary(self.npass, self.nfail);
      process.exitCode = self.nfail;
    }
  });
}
Hath.prototype.run = run;

module.exports = Hath;

function suite(label, steps) {
  return function(t, done) {
    t.run(label, steps, done);
  };
}

module.exports.suite = suite;

function helper(name, fn) {
  Hath.prototype[name] = fn;
}

module.exports.helper = helper;
