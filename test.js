import test from 'ava';
require = require('esm')(module);
const { stats, default: wdt } = require('./who-did-that.mjs');

let firstPath = (t, state, p) => t.deepEqual(stats(state)[0].key, p);

test('should default to empty log', t => {
  const state = wdt({ a: 1 });
  t.deepEqual(stats(state), []);
});

test('should have one element in log when one change', t => {
  const state = wdt({ a: 1 }, { print: false });
  state.a = 42;
  t.is(stats(state).length, 1);
});

test('should work on nested structures', t => {
  let state = wdt({ a: { b: 1 } }, { print: false });
  state.a.b = 42;
  firstPath(t, state, 'a.b');

  state = wdt({ a: { b: { c: 42 } } }, { print: false });
  state.a.b.c = 42;
  firstPath(t, state, 'a.b.c');
});

test('should work on nested structures referred by context this', t => {
  let state = wdt(
    {
      a: 1,
      mutate() {
        this.a = 42;
      }
    },
    { print: false }
  );
  state.mutate();
  firstPath(t, state, 'a');
});

test('should only report on given filter path', t => {
  let state = wdt({ a: { b: 1, c: 3 } }, { filter: 'a.b', print: false });
  state.a.c = 42;
  state.a.b = 42;
  t.is(stats(state).length, 1);
  firstPath(t, state, 'a.b');
});

test('should not print if print false', t => {
  let w = console.warn;
  console.warn = () => t.fail();
  let state = wdt({ a: 1 }, { print: false });
  state.a = 42;
  console.warn = w;
  t.pass();
});

test('should print by default', t => {
  let w = console.warn;
  console.warn = () => t.pass();
  let state = wdt({ a: 1 });
  state.a = 42;
  console.warn = w;
});
