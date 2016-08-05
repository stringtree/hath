var Hath = require('../index');

var parse = require('./parser');

//Simple approach: declare a local function and call it

function testInvalidWithFunction(t, done) {
  function assertProduction(input, expected, message) {
    message = message || '' + input + ' => ' + expected;
    var output = parse(input);
    if (output === expected) {
      t.assert(true, message);
    } else {
      t.assert(false. message + '(was ' + output + ')');
    }
  }

  assertProduction(null, null);
  assertProduction(undefined, null);
  assertProduction('', null, 'empty => null');
  assertProduction('  ', null, 'spaces => null');
  assertProduction('\n', null, 'newline => null');
  done();
} 

// Flexible approach: define a helper which is available everywhere

Hath.helper('assertProduction', function(input, expected, message) {
  message = message || '' + input + ' => ' + expected;
  var output = parse(input);
  if (output === expected) {
    this.assert(true, message);
  } else {
    t.assert(false. message + '(was ' + output + ')');
  }
});

function testInvalidWithHelper(t, done) {
  t.assertProduction(null, null);
  t.assertProduction(undefined, null);
  t.assertProduction('', null, 'empty => null');
  t.assertProduction('  ', null, 'spaces => null');
  t.assertProduction('\n', null, 'newline => null');
  done();
} 

module.exports = Hath.suite('Custom Assertions', [
//  testInvalidWithFunction,
  testInvalidWithHelper
]);

if (module === require.main) {
  module.exports(new Hath());
}
