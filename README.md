# Who Did That?

A debug tool based on JavaScript Proxy to track surprising/unwanted mutation of objects.

In large applications there might be cases where there are some changes to objects you don't expect. These can be hard to track. Not only can the source be in your code, but also external dependencies. For instance something unexpectedly changing the prototype.

**Note** Full disclosure. This package is only useful in a handful cases. It requires you to be able to override/shadow the object you want to inspect, and doesn't work on objects with readonly property descriptors (like prototype). I used this technique to trace what was adding `filter`, `map` et.al. as static functions to the `Array` object (Turns out it was earlier versions of babel).

**Note 2** Currently unpublished. Work in progress, proof of concept.

```js
import wdt, { stats } from 'who-did-that';

Object = wdt(Object);
Object.is = () => true;

// PRINTS:
//
// Warning: Mutation detected.
//   Path: is
//   Change: function is() { [native code] } → () => true
// -------------------------
// Best guess for location:
//   file:///Users/mikaelbrevik/Sites/exp/who-did-that/demo.mjs:5:11

console.log(stats(Object));
```

And the `stats` outputs structured info"

```json
[
  {
    path: ["is"],
    key: "is",
    loc: {
      file: "file:///Users/mikaelbrevik/Sites/exp/uendre/demo.mjs",
      line: "5",
      char: "11"
    }
  }
]
```

## Debug

You can also trigger a breakpoint in the debugger (have to step up the stack trace manually):

```js
import wdt from 'who-did-that';

Object = wdt(Object, { debug: true });
Object.is = () => true;
```

## Only listen for specific changes

```js
import wdt from 'who-did-that';

let obj = wdt({ a: 1, b: { c: 2, d: 3 } }, { filter: 'b.d' });
obj.b.d = 42;
```

## Options and default

```js
// Options & default
let options = {
  filter = '*', // String to match for logging/debugging. Default wildcard (everything)
  filterFn = (readablePathString, pathArray) => false,  // Function predicate for filtering  similar to filter string above
  debug = false, // Trigger debug breakpoint?
  print = true // Print output?
};
```

## TODO

* More tests
* Better errors on readonly (e.g. prototype) properties.
