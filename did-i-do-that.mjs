const statsSymbol = Symbol('WhoDidThat_Stats');

let shouldNest = val =>
  (typeof val === 'object' && val != null) || typeof val === 'function';

let stringList = i =>
  typeof i.toString === 'undefined' ? 'unknown' : i.toString();

function whoDidThatRec(obj, opts, path, log) {
  let {
    filter = '*',
    filterFn = () => false,
    debug = false,
    print = true
  } = opts;
  let joined = p => path.concat(p).join('.');
  let isWildcard = filter === '*';

  return new Proxy(obj, {
    get(target, key) {
      let val = Reflect.get(target, key);
      if (shouldNest(val)) {
        return whoDidThatRec(val, opts, path.concat(key), log);
      }
      return val;
    },

    defineProperty(target, key, value) {
      let isSysKey = key === statsSymbol;
      let totalPath = path.concat(key);
      let readable = totalPath.map(stringList).join('.');
      let matchesFilter = readable === filter;

      if (
        !isSysKey &&
        (isWildcard || matchesFilter || filterFn(readable, totalPath))
      ) {
        log.push({
          path: totalPath,
          key: readable,
          loc: getMutationLocation(4)
        });

        if (print) {
          printMutation(readable, key, obj, value);
        }

        if (debug) {
          debugger;
        }
      }
      return Reflect.defineProperty(target, key, value);
    }
  });
}

export default function whoDidThat(obj, opts = {}) {
  let log = [];
  let res = whoDidThatRec(obj, opts, [], log);
  res[statsSymbol] = log;
  return res;
}

export function stats(obj) {
  return obj[statsSymbol];
}

function printMutation(joined, key, obj, desc) {
  let val =
    desc && typeof desc.value === 'undefined'
      ? `(descriptor) ${JSON.stringify(desc)}`
      : desc.value;

  console.warn(`Warning: Mutation detected.
  Path: ${joined}
  Change: ${obj[key]} → ${val}
-------------------------
${humanizedLocation(6)}
`);
}

function getNextLineAfterThisFile(stack) {
  let cleanedStack = stack
    .split('\n')
    .filter(line => line.match(/:(\d+):(\d+)\s*\)?$/));
  let isThisFile = str => str.match(/\/who-did-that\.m?js/);
  let hasBeenThisFile = false;
  let prev;

  for (let current of cleanedStack) {
    if (current && !isThisFile(current) && prev && isThisFile(prev)) {
      let [file, line, char] = current
        .replace(/^\s*at\s*/, '')
        .split(/:(\d+):/);

      return { file, line, char };
    }
    prev = current;
  }

  return {
    file: 'Not found',
    line: 0,
    char: 0
  };
}

function getMutationLocation() {
  return getNextLineAfterThisFile(Error().stack);
}

function humanizedLocation() {
  let { file, line, char } = getMutationLocation();
  return `Best guess for location:
  ${file}:${line}:${char}`;
}
