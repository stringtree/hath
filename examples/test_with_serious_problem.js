var Hath = require('../index');
var fs = require('fs');

var parse = require('./parser').parse;

function setup(t, done) {
  fs.readFile('./test_script.txt', 'utf8', function (err, data) {
    if (err) {
      throw(new Error('could not load test script'))
    }
    t.locals.testdata = data;
    done()
  });
}

function testParseScript(t, done) {
  var result = parse(t.locals.testdata);
  t.assert(null != result)
  done();
} 

module.exports = Hath.suite('Parse large script', [
  setup,
  testParseScript
]);

if (module === require.main) {
  module.exports(new Hath());
}
