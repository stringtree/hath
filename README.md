# hath

**hath** is a unit test framework, designed for Test-Driven Development.

**hath** is small (one source file of around 100 lines) and has no dependencies so it won't bloat your project,
yet it still includes a test runner, basic asserts, a convenience method for simpler test suite definitions,
and easy control of output format and destination.

* You don't need  a special test runner, just _**node** your-test-file_.
* There's no "magic" behaviour: no names are special, no folders are scanned.
* Uses no fancy version-specific features, tested as far back as node 0.10
* You decide which combinations of single tests or groups of tests are run.
* Tests to run are defined in ordinary code using simple JavaScript data structures and 'require'
* Tests are run in the sequence they are supplied, even if they are asynchronous 
_(as long as they call the supplied callback when finished, of course)_

## Index
* [Usage Example](#usage-example)
* [Design Philosophy](#design-philosophy)
* [API](#api)
* [Usage Hints](#usage-hints)
  * [Extra Asserts](#extra-asserts)
  * [Shared Setup](#shared-setup)
  * [Custom Output](#custom-output)
  * [Exceptions, Events and Errors](#exceptions-events-and-errors)
  * [Suites, Exports and require.main](#suites-exports-and-requiremain)
* [Footnote](#footnote)

## Usage Example
```js
var Hath = require('hath');

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
    t.assert(false, 'unterminated string should throw')
  } catch(err) {
    t.assert(true, 'unterminated string should throw')
  }
  done();
}

function testAsync(t, done) {
  parse_async('12', function(err, value) {
    t.assert(12 === value, 'multiple digits async');
    done();
  });
}

module.exports = Hath.suite('Parser', [
  testInvalid,
  testNumbers,
  testSymbols,
  testStrings,
  testAsync
]);

if (module === require.main) {
  module.exports(new Hath());
}
```

( see examples/test_example.js )

## Design Philosophy

Programming is fun because software can do _anything_, so it feels especially limiting to have to fight against
the very software tools which are supposed to be helping create code.

I have been practicing Test-Driven Development (TDD) since the term was invented.
I was part of the team who helped Kent Beck write
[his seminal book on the subject](https://www.amazon.co.uk/Test-Driven-Development-Addison-Wesley-Signature/dp/0321146530/)
back in 2002,
and I rely on unit tests every working day, in many different programming languages.
Right now, I'm using node.js.

I am fed up with node test frameworks which force me to write my tests their way, pull in reams of dependencies,
and still don't allow me to do simple things such as running different sets of tests for different uses.

I value the simplest possible tools which each do one job and do it well.

I want to bring unit testing back into programming, in a way that makes it easy to use all the
programming skills at our disposal.

Let's get coding!
* Frank Carver @efficacy http://frankcarver.me

## API

### Constructor

    var t = new Hath(optional output specification object)

Create a new **hath** test runner, using the specified output functions (see [Custom Output](#custom-output) ),
or defaults where not specified.
Set the pass and fail counts to zero ready for a new set of tests.

### assert

    t.assert(expression, optional message)

Evaluate the supplied expression.
* If it is truthy, call the 'pass' handler (see [Custom Output](#custom-output) ) with the label for this test and the supplied message
(or a default if not supplied)
* If it is falsy, call the 'fail' handler (see [Custom Output](#custom-output) ) with the label for this test and the supplied message
(or a default if not supplied)

Collect a running total of the number of passes and fails, ready to pass to the 'summary' handler (see [Custom Output](#custom-output) ) after the tests.

### label

    t.label(text)

By default, **hath** passes the test function name as a label to the 'pass' and 'fail' handlers
If you want a different label, just add a call to t.label in your test function somewhere before your asserts.

### run

    t.run(title, steps: array(function(t, done)), next: function(npass, nfail))

Send the supplied test suite title to the 'title' handler, then run the supplied test steps in sequence.
Finally, call the supplied callback with the count of passes and failures.

### suite

     var test = Hath.suite(label, steps: array(function(t, done)))

Convenience method for the common case of constructing a test from a list of other tests.
Note that this is a 'static' function, called on the 'class' rather than an instantiated test runner.
This means that it can be done at any point in your code, typically before deciding whether to create a
fresh test runner or to use an existing one.

The suite function is defined as:

```js
function suite(label, steps) {
  return function(t, done) {
    t.run(label, steps, done);
  };
}
```

### helper

     Hath.helper(name, function)

Convenience method for the common case of defining a function which is available in multiple tests.
As with 'suite' this is a 'static' function, called on the 'class' rather than an instantiated test runner.

Note that typically all test definition files are loaded with 'require' before any tests are executed.
This is a good thing in that it ensures that helpers are made available before they are used, but it
does mean that all tests run with the same set of helpers.
Please _do not_ be tempted to define different helpers with the same name -
things are unlikely to go as expected!

The helper function is defined as:

```js
function helper(name, fn) {
  Hath.prototype[name] = fn;
}
```

## Usage Hints
**hath** is flexible because of its simplicity. Sometimes it seems as if some feature is missing which some
other framework provides, but always remember that _it's just code_ so there is usually a simple and
programmer-friendly way to achieve what you want to do. For example:

### Extra Asserts
**hath** comes with just one built-in assert method:
* **t.assert**(expression, optional message)

This covers the great majority of cases, but sometimes a test might be clearer with a different assert.
Don't be afraid to write code which calls **t.assert**.

A simple example is the fairly common case of asserting that two values are the same, usually known as something like _assertEquals(a,b,message)_. If you have ever hopped between multiple test frameworks, you'll know that this can actually be a bit subtle. Do you put the expected value first, or the actual value. Does it use '==' or '==='. And so on. Hath lets you easily add your own _assertEquals_ which works however you want it to.

There are two basic ways to achieve this.

The simplest is just to write a function within the test function
and call it as required. This has the big advantage that all variables in the test function are in scope,
particularly the test context 't'. The disadvantage of this method is that the custom assert is only available
in a single test.

If you need the same custom assertion in multiple tests, you can define a 'helper' which will be available
to all tests using the same 'Hath'.

```js
var Hath = require('hath');

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
```
( see examples/test_custom_equals.js )

As a more meaty example, some of the parser tests from the previous section could probably be made a bit more readable,
and the test output a bit more useful, by writing a custom assertion which knows how to call the parser
and can explain a but more of what went wrong if a test fails.
 
```js
var Hath = require('hath');

var parse = require('./parser').parse;

Hath.helper('assertProduction', function(input, expected, message) {
  message = message || '' + input + ' => ' + expected;
  var output = parse(input);
  this.assert(output === expected, message + '(was ' + output + ')');
});

function testInvalid(t, done) {
  t.assertProduction(null, null);
  t.assertProduction(undefined, null);
  t.assertProduction('', null, 'empty => null');
  t.assertProduction('  ', null, 'spaces => null');
  t.assertProduction('\n', null, 'newline => null');
  done();
} 

module.exports = Hath.suite('Custom Assertions', [
  testInvalid
]);

if (module === require.main) {
  module.exports(new Hath());
}
```
( see examples/test_custom_assert.js )

There are plenty of third-party modules which can help you boil down complex situations into a single truthy value.
For example, I like [Stringtree Checklist](https://www.npmjs.com/package/stringtree-checklist) for the
common-but-tricky task of comparing collections which may not always be in the same order.

For an example of how this might work imagine we are developing a loader component,
whose job it is is to call an array of asynchronous resolver functions in parallel and collect any successful results.
This is a common node.js implementation pattern, for example when gathering results for several
different web services, and shows the power of node.js. Here's our code:

```js
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
    async.parallel(catchers, function(err) {
      next(err, ret);
    });
  });
}
```

It makes significant use of async functions, and the order of the results in the 'ret' array depends on
what order the resolvers happen to be called, and how long each one takes to respond.
The one thing we can't do is just compare the returned array against a 'correct' example, it would fail more
often than not.

Yet we still want to test that it does the right thing for quick responses, for slow responses,
out-of-sequence responses and for errors.

Using **hath** and a custom assert built using _Stringtree Checklist_ such a test might look like:

```js
var Hath = require('hath');
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
```

( see examples/test_loader.js )

To prove to yourself that this works, feel free to uncomment the console.log statement and run the test a few times using 
``node examples/test_loader`` to see that the loaded values appear in a different order, but the tests still pass.

### Shared Setup

Some test frameworks have special 'before' and 'after' functions which are automatically applied to all test functions.
The ease of callbacks in JavaScript and the simplicity of **hath** make such things very easy to achieve, anyway,
without any magic.

For code run before each test:

```js
var Hath = require('hath');

function setup(code) {
  var sofar = [1, 2];
  code(sofar);
}

function testSingle(t, done) {
  setup(function(sofar) {
    sofar.push(3);
    t.assert(sofar.length === 3);
    done();
  });
} 

function testDouble(t, done) {
  setup(function(sofar) {
    sofar.push(3);
    sofar.push(4);
    t.assert(sofar.length === 4);
    done();
  });
} 

// test with different setup
function testEmpty(t, done) {
  var sofar = [];
  t.assert(sofar.length === 0);
  done();
}

module.exports = Hath.suite('tt', [
  testSingle,
  testDouble,
  testEmpty,
]);

if (module === require.main) {
  module.exports(new Hath());
}

```

Although this approach can seem a bit clumsy compared with _magical functions_, it  has several subtle benefits:
* You are free to have some tests which do use the setup function, and some which don't
* You can have several different setup functions in the same test file and use them as needed
* You can insert your own code before and after the setup function
* setup is just an ordinary function, no special names or annotations, no accidental clashes

Running code before or after a whole suite of tests is even simpler. Just add your setup code at the start
and/or end of the array of test functions which form the test suite.
Such functions are passed the running test context, just like any other test function, including a
'scratchpad' object _t.locals_ where you may put whatever you like.
You do not need to make any assertions if you don't wan't to, but do remember to call 'done' when complete.

For example:

```js
var Hath = require('hath');

function setup(t, done) {
  t.locals.name = 'Darkness';
  t.locals.compare = function(age) { return age < 99 ? 'old' : 'young' };
  done();
}

function testOriginatingName(t, done) {
  t.assert(t.locals.name.length === 8);
  t.locals.lyric = 'hello ' + t.locals.name;
  done();
}

function testRelationship(t, done) {
  t.assert(t.locals.compare(100) === 'young');
  t.locals.lyric += ', my ' + t.locals.compare(50) + ' friend';
  done();
}

function teardown(t, done) {
  console.log(t.locals.lyric);
  done();
}

module.exports = function(t, done) {
    t.run('Songs', [
      setup,
      testOriginatingName,
      testRelationship,
      teardown
    ], done);
};

if (module === require.main) {
  module.exports(new Hath());
}
```

### Custom Output

The job of a test framework is to run tests, collect and present the results.
There are lots of different possibilities for how to present test results,
so **hath** makes it easy to tailor output however you like.
By default **hath** writes test output using console.log, but this is easily overriden
by supplying definitions to the Hath() constructor.

The Hath() constructor takes a single JavaScript object as a parameter, and looks for the following fields:
* **title** - function taking a single parameter.
Called with a test suite description just before it starts
* **pass** - function taking two parameters.
Called with the function name and the supplied (or defaulted) message for every assert which succeeds
* **fail** - function taking two parameters.
Called with the function name and the supplied (or defaulted) message for every assert which fails
* **summary** - function taking two parameters.
Called with number of passes and number of fails after the final test completes
* **message** - default message for _assert_ if none is supplied

As an example, the default options in the source code are:

```js
var default_options = {
  title: function(text) { console.log(text + ':'); },
  pass: function(label, message) { /* by default, don't log passes, just count them */ },
  fail: function(label, message) { console.log('FAIL ' + label + ': ' + message); },
  summary: function(npass, nfail) {
    console.log('----');
    console.log('PASS: ' + npass);
    console.log('FAIL: ' + nfail);
    console.log(0===nfail ? 'TESTS PASS' : 'TESTS FAIL');
  },
  message: 'assert'
};
```
**hath** will use the above defaults for any fields not specified in the options object,
so feel free to override (say) just the summary, or just pass or fail, etc.

### Exceptions, Events and Errors

**hath** does nothing to catch exceptions or events.
If you care about the exception or event behaviour of your code, you will need to catch them explicitly in your tests.
Un-caught exceptions will typically stop the test process and display a stack trace.

For example:

```js
var Hath = require('hath');

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

module.exports = Hath.suite('Exceptions', [
  testExceptions
]);

if (module === require.main) {
  module.exports(new Hath());
}
```

If that seems a bit wordy, remember that you can always define your own assert helper, perhaps like:

```js
var Hath = require('hath');

var parse = require('./parser').parse;

Hath.helper('assertThrows', function assertThrows(message, code) {
  try {
    code();
    this.assert(false, message);
  } catch (e) {
    this.assert(true, message);
  }
});

Hath.helper('assertDoesNotThrow', function assertDoesNotThrow(message, code) {
  try {
    code();
    this.assert(true, message);
  } catch (e) {
    this.assert(false, message);
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
  testExceptionsWithHelper
]);

if (module === require.main) {
  module.exports(new Hath());
}
```

( see examples/test_exceptions.js )

In a test suite there are essentially two types of errors:

* Those to be counted, but testing should continue ( "_business as usual_" )
* Those which are so serious or so unexpected that further testing is invalidated
( "_If this fails, all bets are off_")

**hath** allows you to distinguish between these two cases. 
* For _business as usual_ errors, just count them with an assert and move on.
* For _all bets are off_ errors, throw an exception to halt testing with a stacktrace
indicating what went wrong where.

```js
var Hath = require('hath');
var fs = require('fs');

var parse = require('./parser').parse;

function setup(t, done) {
  fs.readFile('./test_script.txt', 'utf8', function (err, data) {
    if (err) {
      throw(new Error('could not load test script'));
    }
    t.locals.testdata = data;
    done();
  });
}

function testParseScript(t, done) {
  var result = parse(t.locals.testdata);
  t.assert(null != result);
  done();
} 

module.exports = Hath.suite('Parse large script', [
  setup,
  testParseScript
]);

if (module === require.main) {
  module.exports(new Hath());
}
```

(see examples/test_with_serious_problem.js )

### Suites, Exports and require.main

For speed of development, I like to be able to run any of my test files on their own as well as part of an overall
test suite.
This approach means that I can easily work with a single test file until I get it passing,
then run a different test file, a group of test files, or the whole test suite without any changes to the code.

To make this work, each test file needs to be both runnable on its own, **and** callable as part of a larger group
of tests.
As you may have noticed in the examples above, each test file ends with assigning a function to 'module.exports'
and (if the test file has been called on its own) running the exported function using a fresh Hath instance.

By taking this approach, every test file is also a test function, exposing the same function(t, done) API.
A file which runs a sequence of other test files has the same structure as a file running individual tests:

```js
var Hath = require('hath');

module.exports = Hath.suite('All tests', [
  require('./test_symbols'),
  require('./test_level1'),
  require('./test_level2')
]);

if (module === require.main) {
  module.exports(new Hath());
}
```
This is a principle known as [_self similarity_](http://www3.amherst.edu/~rloldershaw/nature.html).

As a small side-note, the example code in this document assigns a function to _module.exports_, which is a common idiom
indicating that this function is what a caller will get when it uses, for example, ``require('./mytest')``.
Slightly less common is the use of _module_exports_ as a function within the same file.
This is a convenience to save the need to create a separate variable just to assign to _module_exports_.

You may also have noticed that the top-level call in the require.main of each example does not pass a 'done' callback.
If no callback is provided, **hath** sends test summary output to its configured 'summary' handler instead.
By default, this writes to console.out, but is easily changed by supplying overrides to the _new Hath()_
constructor as described above.

## Footnote

* **hath** _may_ stand for **h**ardly **a**ny **t**est **h**arness
* **hath** _may_ be a reference to [fish-faced colonists from Doctor Who](http://tardis.wikia.com/wiki/Hath)
* **hath** _may_ refer to 'to cause to, as by command or invitation', see http://www.dictionary.com/browse/hath
* **hath** _may_ just be a short name which was not already used for another npm module.

You decide ;)

_For he that **hath**_, _to him shall be given_" (Mark 4:25, KJV)
