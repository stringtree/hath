# hath

"_For he that **hath**_, _to him shall be given_" (Mark 4:25, KJV)

**hath** is a unit test framework which is just regular Javascript code.
* You don't need  a special test runner, just _**node** your-test-file_.
* There's no "magic" behaviour: no names are special, no folders are scanned.
* Uses no fancy version-specific features, tested as far back as node 0.10
* You can call any combination of single tests or groups of tests from your own code, or from other tests.
* Which tests to run are defined in ordinary code using simple JavaScript data structures and 'require'
* Tests are run in the sequence they are supplied, even if they are asynchronous 
_(as long as they call the supplied callback when finished)_

**hath** is small (one source file of around 100 lines) and has no dependencies so it won't bloat your project,
yet it still includes a test runner, basic asserts, a convenience method for simpler test suite definitions,
and easy control of output format and destination.  

## Usage Example
```js
var Hath = require('hath');

function testOddNumbers(t, done) {
  t.assert(3 > 1);
  t.assert(5 > 3);
  done(); 
}

function testEvenNumbers(t, done) {
  t.assert(4 > 2, 'even numbers should work, too');
  done(); 
}

function testSameNumbers(t, done) {
  t.assert(4 === (2 * 2), 'two times two is four');
  done(); 
}

module.exports = Hath.suite('Numbers', [
  testOddNumbers,
  testEvenNumbers,
  testSameNumbers
]);

if (module === require.main) {
  module.exports(new Hath());
}
```
## Design Philosophy

I have been practicing Test-Driven Development (TDD) since the term was invented.
I was part of the team who helped Kent Beck write [his seminal book on the subject](https://www.amazon.co.uk/Test-Driven-Development-Addison-Wesley-Signature/dp/0321146530/) back in 2002,
and I rely on unit tests every working day, in many different programming languages. Right now, I'm using node.js.

I value the simplest possible tools which each do one job and do it well.

Programming is fun because software can do _anything_, so it feels especially limiting to have to fight against
the very software tools which are supposed to be helping create code.
I am fed up with node test frameworks which force me to write my tests their way, pull in reams of dependencies,
and still don't allow me to do simple things such as running different sets of tests for different uses.

I want to bring unit testing back into programming, in a way that makes it easy to use all the programming skills at our disposal.

Let's get coding!
* Frank Carver @efficacy http://frankcarver.me

## API

### Constructor

    var t = new Hath(optional output specification object)

Create a new **hath** test runner, using the specified output functions, or defaults where not specified. Set the pass and fail counts to zero ready for a new set of tests. 

### assert

    t.assert(expression, optional message)

Evaluate the supplied expression.
* If it is truthy, call the 'pass' handler with the supplied message (or a default if not supplied)
* If it is falsy, call the 'fail' handler with the supplied message (or a default if not supplied)

### label

    t.label(text)

Use the supplied text instead of the test function name as a label in test output.
If you want to do this, just add a call to t.label in your test function somewhere before your asserts.

### run

    t.run(title, steps: array(function(t, done)), next: function(npass, nfail))

Send the supplied test suite title to the 'title' handler, then run the supplied test steps in sequence.
Finally, call the supplied callback with the count of passes and failures.

### suite

     var test = Hath.suite(label, steps: array(function(t, done)))

Convenience method for the common case of constructing a test from a list of other tests.
Note that this is a 'static' function, called on the 'class' rather than an instantiated test runner.
This means that it can be done at any point in your code, typically before deciding whether to create a fresh test runner or to use an existing one.

The suite function is defined as:

```js
function suite(label, steps) {
  return function(t, done) {
    t.run(label, steps, done);
  };
}
```

## Usage Hints
**hath** is flexible because of its simplicity. Sometimes it seems as if some feature is missing which some other framework provides, but always remember that _it's just code_ so there is usually a simple work-around in your tests. For example:

### Extra Asserts
**hath** comes with just one built-in assert method:
* **t.assert**(expression, optional message)

This covers the great majority of cases, but sometimes a test might be clearer with a different assert. Don't be afraid to write code which calls **t.assert**. 

As an example, imagine you wish to test that two values _do not_ equal each other
```js
var Hath = require('hath');

// manual approach, just use t.assert
function testManual(t, done) {
  t.assert(3 !== 4, 'three should not be four');
  done();
} 

// declare a local function and call it
function testNE(t, done) {
  function assertNotEqual(actual, expected, message) {
    message = message || 'should not be ' + expected + ' but was ' + actual + '';
    t.assert(actual !== expected, message);
  }
  
  assertNotEqual(3, 4);
  done();
} 

// to make an assert which is a 'first class citzen', 
// create one which uses **this**, and bind it to the hath test object
function assertNotEqual(actual, expected, message) {
  message = message || 'should not be ' + expected + ' but was ' + actual + '';
  this.assert(actual !== expected, message);
}
function testNE2(t, done) {
  t.assertNotEqual = assertNotEqual;
  t.assertNotEqual(5, 4);
  done();
} 

module.exports = Hath.suite('tt', [
  testManual,
  testNE,
  testNE2
]);

if (module === require.main) {
  module.exports(new Hath());
}
```

If you want to go a bit further, and need similar asserts in several places in your project,
you can easily create your own derivative of hath which has whatever extras you like:

Create a file, say _hathmore.js_
```js
var Hath = require('hath');

Hath.prototype.assertNotEqual = function assertNotEqual(actual, expected, message) {
  message = message || 'should not be ' + expected + ' but was ' + actual + '';
  this.assert(actual !== expected, message);
};

module.exports = Hath;
```
Then you can use that instead:

```js
var Hath = require('./hathmore');

function testNE(t, done) {
  t.assertNotEqual(5, 4);
  done();
} 

module.exports = Hath.suite('tt', [
  testNE
]);

if (module === require.main) {
  module.exports(new Hath());
}
```

There are plenty of third-party modules which can help you boil down complex situations into a single truthy value. For example, I like [Stringtree Checklist](https://www.npmjs.com/package/stringtree-checklist) for the common-but-tricky task of comparing collections which may not always be in the same order.

### Shared setup

Some test frameworks have special 'before' and 'after' functions which are automatically applied to all test functions. **hath** deliberately lacks these kinds of features as they impose a particular way of working. The ease of callbacks in JavaScript make such things very easy to achieve, anyway, without any magic.

```js
var Hath = require('hath');

var sofar = [];

function setup(code) {
  sofar = [1, 2];
  code();
}

function testEmpty(t, done) {
  t.assertEqual(sofar.length, 0);
  done();
} 

function testSingle(t, done) {
  setup(function() {
    sofar.push(3);
    t.assertEqual(sofar.length, 3);
    done();
  });
} 

function testDouble(t, done) {
  setup(function() {
    sofar.push(3);
    sofar.push(4);
    t.assertEqual(sofar.length, 4);
    done();
  });
} 

module.exports = Hath.suite('tt', [
  testEmpty,
  testSingle,
  testDouble
]);

if (module === require.main) {
  module.exports(new Hath());
}

```

Although this approach can seem a bit clumsy compared with magical functions, it  has several subtle benefits:
* You are free to have some tests which do use the setup function, and some which don't
* You can have several different setup functions in the same test file and use them as needed
* You can insert your own code before and after the setup function
* setup is just an ordinary function, no special names or annotations needed

### Custom Output

The job of a test framework is to run tests, collect and present the results.
There are lots of different possibilities for how to present test results, so **hath** makes it easy to tailor output 
however you like. By default **hath** writes test output using console.log, but this is easily overriden by supplying definitions to the Hath() constructor.

The Hath() constructor takes a single JavaScript object as a parameter, and looks for the following fields:
* **title** - function taking a single parameter. Called with a test suite description just before it starts
* **pass** - function taking two parameters. Called with the function name and the supplied (or defaulted) message for every assert which succeeds
* **fail** - function taking two parameters. Called with the function name and the supplied (or defaulted) message for every assert which fails
* **summary** - function taking two parameters. Called with number of passes and number of fails after the final test completes
* **message** - default message for _assert_ if none is supplied

As an example, the default options in the source code are:

```js
var default_options = {
  title: function(text) { console.log(text + ':'); },
  pass: function(name, message) { console.log('PASS ' + name + ': ' + message); },
  fail: function(name, message) { console.log('FAIL ' + name + ': ' + message); },
  summary: function(npass, nfail) {
    console.log('----');
    console.log('PASS: ' + npass);
    console.log('FAIL: ' + nfail);
    console.log(0===nfail ? 'TESTS PASS' : 'TESTS FAIL');
  },
  message: 'assert'
};
```
**hath** will use the above defaults for any fields not specified in the options object, so feel free to override (say) just the summary, or just pass and fail, etc.

### Exceptions and Events

**hath** does nothing to catch exceptions or events. If you care about the exception or event behaviour of your code,
you will need to catch them explicitly in your tests. Un-caught exceptions will typically stop the test process and display a stack trace. 

### Exports and require.main

For speed of development, I like to be able to run any of my test files on their own as well as part of an overall test suite. 
This approach means that I can easily work with a single test file until I get it passing,
then run a different test file, a group of test files, or the whole test suite without any changes to the code.

To make this work, each test file needs to be both runnable on its own, **and** callable as part of a larger group of tests. 
This is certainly possible in Node.js, but it can be a little wordy.
As you may have noticed in the examples above, each test file ends with assigning a function to 'module.exports'
and (if the test file has been called on its own) running the exported function using a fresh Hath instance.

By taking this approach, every test file is also a test function, exposing the same function(t, done) API.
A file which runs a sequence of other test files has the same structure as a file running individual tests:

```js
const Hath = require('hath');

module.exports = Hath.suite('All tests', [
  require('./test_symbols'),
  require('./test_level1'),
  require('./test_level2')
]);

if (module === require.main) {
  module.exports(new Hath());
}
```
This is a principle known as [_self similarity_](http://www3.amherst.edu/~rloldershaw/nature.html) and it can be very powerful.

You may have noticed that the top-level call in the require.main of each example does not pass a callback.
If no callback is provided, **hath** sends test summary output to its configured 'summary' handler instead.
By default, this writes to console.out, but is easily changed by supplying overrides to the _new Hath()_ constructor as described above. 

## Footnote

* **hath** _may_ stand for **h**ardly **a**ny **t**est **h**arness
* **hath** _may_ be a reference to [fish-faced colonists from Doctor Who](http://tardis.wikia.com/wiki/Hath)
* **hath** _may_ refer to 'to cause to, as by command or invitation', see http://www.dictionary.com/browse/hath
* **hath** _may_ just be a short name which was not already used for another npm module.

You decide ;)
