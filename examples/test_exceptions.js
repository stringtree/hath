var Hath = require('../index');

var parse = require('./parser').parse;

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

Hath.helper('assertThrows', function assertThrows(message, code) {
  try {
    code();
    this.assert(false, message)
  } catch (e) {
    this.assert(true, message)
  }
});

Hath.helper('assertDoesNotThrow', function assertDoesNotThrow(message, code) {
  try {
    code();
    this.assert(true, message)
  } catch (e) {
    this.assert(false, message)
  }
});

function testExceptionsWithHelper(t, done) {
  t.assertDoesNotThrow('terminated string should not throw', function() {
    parse('"Frank"');
  });

  t.assertThrows('unterminated string should throw', function() {
    parse('"Frank');
  });

  done();
}

module.exports = Hath.suite('Exceptions', [
  testExceptions,
  testExceptionsWithHelper
]);

if (module === require.main) {
  module.exports(new Hath());
}
