var Hath = require('../index');

module.exports = Hath.suite('All Tests', [
  require('./test_example'),
  require('./test_custom_equals'),
  require('./test_custom_assert'),
  require('./test_exceptions'),
  require('./test_loader'),
//  require('./test_with_serious_problem')
]);

if (module === require.main) {
  module.exports(new Hath());
}
