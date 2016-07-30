var async = require('async');

var default_options = {
  pass: (message) => { console.log('PASS: ' + message); },
  fail: (message) => { console.log('FAIL: ' + message); },
  summary: (npass, nfail) => {
    console.log('----');
    console.log('PASS: ' + npass);
    console.log('FAIL: ' + nfail);
  }
};

function TestHelper(options) {
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
TestHelper.prototype.assert = assert;

function assertEquals(actual, expected, message) {
  message = message || 'should be "' + expected + '" but was "' + actual + '"';
  this.assert(actual === expected, message);
}
TestHelper.prototype.assertEquals = assertEquals;

function end() {
  this.options.summary(this.npass, this.nfail);
}
TestHelper.prototype.end = end;

function run(label, steps, next) {
  console.log(label + ':');
  async.eachSeries(steps, (step, done) => {
    step(this, done);
  },
  (err) => { if (next) { next(); } else { this.end(); }});
}
TestHelper.prototype.run = run;

module.exports = TestHelper;

function suite() {
  var params = Array.prototype.slice.call(arguments);
  var label = params.shift();
  return function(t, done) {
    if (null == t) t = new TestHelper();
    t.run(label, params, done);
  };
}

module.exports.suite = suite;
