var async = require('async');

module.exports = function loader(resolvers, next) {
  var ret = [];
  var catchers = [];
  async.forEach(resolvers, function(r, done) {
    catchers.push(function(done) {
      r(function(err, value) {
        if (!err) ret.push(value);
        done();
      });
    });
    done();
  }, function() {
    async.parallel(catchers, function() {
      next(null, ret);
    });
  });
}