var Hath = require('../index');

var parser = require('./parser');
var parse = parser.parse;
var parse_async = parser.parse_async;

function testInvalid(t, done) {
  t.assert(null === parse(null), 'null => null');
  t.assert(null === parse(undefined), 'undefined => null');
  t.assert(null === parse(''), 'space => null');
  t.assert(null === parse('  '), 'spaces => null');
  t.assert(null === parse('\n'), 'newline => null');
  done();
}

function testNumbers(t, done) {
  t.assert(0 === parse('0'), '0');
  t.assert(1 === parse('1'), 'single digit');
  t.assert(12 === parse('12'), 'multiple digits');
  t.assert(-52 === parse('-52'), 'negative');
  done();
}

function testSymbols(t, done) {
  t.assert(true === parse('t'), 'true');
  t.assert(false === parse('f'), 'false');
  t.assert(null === parse('n'), 'null');
  done();
}

function testStrings(t, done) {
  t.assert('' === parse('""'), 'empty');
  t.assert('a' === parse('"a"'), 'single character');
  t.assert('bc' === parse('"bc"'), 'multiple character');
  t.assert("f e" === parse('"f e"'), 'string with spaces');
  t.assert("2" === parse('"2"'), 'string with number');
  try {
    var ret = parse('"2');
    t.assert(false, 'unterminated string should throw');
  } catch(err) {
    t.assert(true, 'unterminated string should throw');
  }
  done();
}

function testAsync(t, done) {
  parse_async('12', function(err, value) {
    t.assert(12 === value, 'multiple digits async');
    done();
  });
}

function testError(t, done) {
  done(new Error('Oh No!!'));
}

module.exports = Hath.suite('Parser', [
  testInvalid,
  testNumbers,
  testSymbols,
  testStrings,
  testAsync,
  testError
]);

if (module === require.main) {
  module.exports(new Hath());
}
