var Hath = require('../index');

module.exports = Hath.suite('All Tests', [
  require('./test_example'),
  require('./test_exceptions'),
  require('./test_custom_assert')
]);

if (module === require.main) {
  module.exports(new Hath());
}
