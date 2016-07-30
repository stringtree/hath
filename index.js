// hath
var util = require('util');

var default_options = {
  pass: (message) => { console.log('PASS: ' + message); },
  fail: (message) => { console.log('FAIL: ' + message); },
  summary: (npass, nfail) => {
    console.log('----');
    console.log('PASS: ' + npass);
    console.log('FAIL: ' + nfail);
    console.log(0===nfail ? 'TESTS PASS' : 'TESTS FAIL');
  }
};

function Hath(options) {
  this.options = options || {};
  this.options.pass = this.options.pass || default_options.pass; 
  this.options.fail = this.options.fail || default_options.fail; 
  this.options.summary = this.options.summary || default_options.summary; 
  this.npass = 0;
  this.nfail = 0;
}

function assert(condition, message) {
  message = message || 'assertion failure';
  if (condition) {
    ++this.npass;
    this.options.pass(message);
  } else {
    ++this.fail;
    this.options.fail(message);
  }
}
Hath.prototype.assert = assert;

function assertEqual(actual, expected, message) {
  message = message || 'should be ' + expected + ' but was ' + actual + '';
  this.assert(actual === expected, message);
}
Hath.prototype.assertEqual = assertEqual;

function end() {
  this.options.summary(this.npass, this.nfail);
}
Hath.prototype.end = end;

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
  console.log(label + ':');
  sequence(this, steps, (err) => { if (next) { next(); } else { this.end(); }});
}
Hath.prototype.run = run;

module.exports = Hath;

function suite() {
  var steps = Array.prototype.slice.call(arguments);
  var label = steps.shift();
  return function(t, done) {
    if (null == t) t = new Hath();
    t.run(label, steps, done);
  };
}

module.exports.suite = suite;
