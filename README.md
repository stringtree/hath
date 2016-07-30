# hath

"_For he that **hath**_, _to him shall be given_" (Mark 4:25, KJV)

**hath** is a unit test framework which is just regular Javascript code.
* You don't need  a special test runner, just _**node** your-test-file_.
* There's no "magic" behaviour: no names are special, no folders are scanned.
* You can call single tests or groups of tests from your own code, or from other tests.
* If you want to include a test, call it in your code; if you want to exclude a test, delete it or comment it out
* Tests are run in the sequence they are supplied, even if they are asynchronous 
(as long as they call the supplied 'done' when finished)

**hath** is small (one source file of around 100 lines) and has no dependencies so it won't bloat your project, yet it still includes a test runner, basic asserts, a convenience method for simpler test suite definitions, and easy control of output format and destination.  

## Usage Example
```js
var Hath = require('hath');

function testOddNumbers(t, done) {
  t.assert(5 > 3);
  done(); 
}

function testEvenNumbers(t, done) {
  t.assert(4 > 2, 'even numbers should work, too');
  done(); 
}

function testSameNumbers(t, done) {
  t.assertEqual(4, 3.5);
  done(); 
}

module.exports = Hath.suite('Numbers', 
  testOddNumbers,
  testEvenNumbers,
  testSameNumbers
);

if (module === require.main) {
  module.exports(new Hath());
}
```
## Design Philosophy

I am fed up with node test frameworks which force me to write my tests their way, pull in reans of dependencies, and still don't allow me to do simple things such as running different sets of tests for different uses.

Programming is fun because software can do _anything_, so it feels especially limiting to have to fight against the very software which is supposed to be helping create code.

I want to bring unit testing back into programming, in a way that makes it easy to use all the programming skills at our disposal.

Let's get coding!

* ( **hath** _may_ stand for **h**ardly **a**ny **t**est **h**arness )  

## API

## Usage Hints
**hath** is flexible because of its simplicity. Sometimes it seems as if some feature is missing which some other framework provides, but always remember that _it's just code_ so there is usually a simple work-around in your tests. For example:

### Extra Asserts
**hath** comes with two built-in assert methods:
* **t.assert**(truthy-expression, optional message)
* **t.assertEqual**(actual-value, expected-value, optional message)

These cover the great majority of cases, but sometimes a test might be clearer with a different assert. Don't be afraid to write code which calls **t.assert**. 

As an example, imagine you wish to test that two values _do not_ equal each other
```js
var Hath = require('hath');

// simplest case, declare a local function and call it
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

module.exports = Hath.suite('tt',
  testNE,
  testNE2
);

if (module === require.main) {
  module.exports(new Hath());
}
```

### Shared setup

Some test frameworks have special 'before' and 'after' functions which are automatically applied to all test functions. **hath** deliberately lacks these kinds of features as they impose a particular way of working. The ease of callbacks in JavaScript make such things very easy to achieve, without any magic.

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

module.exports = Hath.suite('tt',
  testEmpty,
  testSingle,
  testDouble
);

if (module === require.main) {
  module.exports(new Hath());
}

```

Although this approach can seem a bit clumsy compared with magical functions, it  has several subtle benefits:
* You are free to have some tests which do use the setup function, and some which don't
* You can have several different setup functions in the same test file and use them as needed
* You can insert your own code before and after the setup function
* setup is just an ordinary function, no special names or annotations needed 

### Exports and require.main

For speed of development, I like to be able to run any of my test files on their own 
as well as part of an overall test suite. This approach means that I can easily work with a single test file until I get it passing, then run a different test file, a group of test files, or the whole test suite without any changes to the code.

To make this work, each tets file needs to be both runnable on its own, and callable as part of a larger group of tests. This is certainly possible in Node.js, but it is a little wordy.
As you may have noticed in the examples above, each test file ends with assigning a function to 'module.exports' and (if the test file has been called on its own) running the exported function using a fresh Hath instance.

By taking this approach, every test file is also a test function, exposing the same function(t, done) API. A file which runs a sequeche of other test files has an identical structure:

```js
const Hath = require('hath');

module.exports = Hath.suite('All tests',
  require('./test_symbols'),
  require('./test_level1')
);

if (module === require.main) {
  module.exports(new Hath());
}
```
This is a principle known as _self similarity_ and it is very powerful.
