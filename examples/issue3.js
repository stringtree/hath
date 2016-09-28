var Hath = require('..')

function shouldFail(t, done) {
    done(new Error('Oh Noes'))
}

module.exports = Hath.suite('Tests', [
    shouldFail
])

if (module === require.main) {
  module.exports(new Hath())
}