// hath
var util = require('util');

var default_options = {
  label: function(text) { console.log(text + ':'); },
  pass: function(message) { console.log('PASS: ' + message); },
  fail: function(message) { console.log('FAIL: ' + message); },
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
  this.options.label = this.options.label || default_options.label; 
  this.options.pass = this.options.pass || default_options.pass; 
  this.options.fail = this.options.fail || default_options.fail; 
  this.options.summary = this.options.summary || default_options.summary; 
  this.options.message = this.options.message || default_options.message; 
  this.npass = 0;
  this.nfail = 0;
}

function assert(condition, message) {
  message = message || this.options.message;
  if (condition) {
    ++this.npass;
    this.options.pass(message);
  } else {
    ++this.fail;
    this.options.fail(message);
  }
}
Hath.prototype.assert = assert;

function sequence(t, steps, done) {
  var nsteps = steps.length;
  if (!nsteps) return done();

  var count = 0;
  var message;

  function complete(err) {
    ++count;
    message = message || err;
    if (nsteps > count) {
      steps[count](t, complete);
    } else {
      done(message);
    }
  }

  steps[count](t, complete);
}

function run(label, steps, next) {
  var self = this;
  self.options.label(label);
  sequence(this, steps, function(err) {
    if (next) {
      next(self.npass, self.nfail);
    } else {
      self.options.summary(self.npass, self.nfail);
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
