var Hath = require('../index');

var parse = require('./parser');

function testExceptions(t, done) {
  try {
    parse('"Frank"');
    t.assert(true, 'terminated string should not throw');
  } catch (e) {
    t.assert(false, 'terminated string should not throw');
  }

  try {
    parse('"Frank');
    t.assert(false, 'unterminated string should throw');
  } catch (e) {
    t.assert(true, 'unterminated string should throw');
  }

  done();
}

function codeThrows(code) {
  try {
    code();
    return false;
  } catch (e) {
    return true;
  }
}

function testExceptionsWithHelper(t, done) {
  t.assert(!codeThrows(function() {
    parse('"Frank"');
  }), 'terminated string should not throw');

  t.assert(codeThrows(function() {
    parse('"Frank');
  }), 'unterminated string should throw');

  done();
}

module.exports = Hath.suite('Exceptions', [
  testExceptions,
  testExceptionsWithHelper
]);

if (module === require.main) {
  module.exports(new Hath());
}
