var Hath = require('../index');

var parse = require('./parser');

Hath.helper('assertProduction', function(input, expected, message) {
  message = message || '' + input + ' => ' + expected;
  var output = parse(input);
  this.assert(output === expected, message + '(was ' + output + ')');
});

function testInvalid(t, done) {
  t.assertProduction(null, null);
  t.assertProduction(undefined, null);
  t.assertProduction('', null, 'empty => null');
  t.assertProduction('  ', null, 'spaces => null');
  t.assertProduction('\n', null, 'newline => null');
  done();
} 

module.exports = Hath.suite('Custom Assertions', [
  testInvalid
]);

if (module === require.main) {
  module.exports(new Hath());
}
