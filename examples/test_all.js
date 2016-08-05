var Hath = require('../index');

module.exports = Hath.suite('All tests', [
  require('./test_example'),
  require('./test_exceptions')
]);

if (module === require.main) {
  module.exports(new Hath());
}
