var Hath = require('../index');

// Simple approach: declare a local function and call it

function testConcatenationWithFunction(t, done) {
  function assertEquals(expected, actual, message) {
    message = message || 'assertEquals';
    t.assert(actual===expected, '' + message + ': expected "' + expected + '" but was "' + actual + '"');
  }

  assertEquals('', [].join(' '), 'empty array');
  assertEquals('hath', ['hath'].join(' '), 'single entry');
  assertEquals('hath is cool', ['hath','is','cool'].join(' '), 'multiple entry');
  done();
} 

// Flexible approach: define a helper which is available everywhere

Hath.helper('assertEquals', function(expected, actual, message) {
  message = message || 'assertEquals';
  this.assert(actual===expected, '' + message + ': expected "' + expected + '" but was "' + actual + '"');
});

function testConcatenationWithHelper(t, done) {
  t.assertEquals('', [].join(' '), 'empty array');
  t.assertEquals('hath', ['hath'].join(' '), 'single entry');
  t.assertEquals('hath is cool', ['hath','is','cool'].join(' '), 'multiple entry');
  done();
} 

module.exports = Hath.suite('Custom Equals', [
  testConcatenationWithFunction,
  testConcatenationWithHelper
]);

if (module === require.main) {
  module.exports(new Hath());
}
