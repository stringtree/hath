var Hath = require('../index');
var Checklist = require('stringtree-checklist');

var load = require('./async_loader');

Hath.helper('assertChecklist', function(expected, actual) {
  var self = this;
  var ck = new Checklist(expected);
  actual.forEach(function(i) {
    ck.tick(i, function (err, message) {
      if (err) t.assert(false, err);
    });
  });
  ck.check(function(err, message) {
    message = message || 'all values loaded once each';
    if (err) message = err;
    self.assert(!err, message);
  });
});

// stub operation which waits for a random amount of time before returning
function resolve_delay(s) {
  return function(done) {
    setTimeout(function() {
      done(null, s);
    }, Math.random() * 100);
  };
}

//stub operation which fails with an error
function resolve_error(s, e) {
  return function(done) {
    done(new Error(e), s);
  };
}

function testParallelLoad(t, done) {
  load([
    resolve_delay('cherry'),
    resolve_delay('apple'),
    resolve_delay('damson'),
    resolve_error('eggplant', 'resource not found'),
    resolve_delay('banana')
  ], function(err, values) {
//    console.log('actual loaded values: ', values);
    t.assertChecklist(['apple', 'banana', 'cherry', 'damson'], values);
    done();
  });
}

module.exports = Hath.suite('Loader', [
  testParallelLoad
]);

if (module === require.main) {
  module.exports(new Hath());
}
