/** @template V @typedef { import('./val_or_error.d.ts').ValOrErr<V> } ValOrErr */
/** @template V @typedef { import('./val_or_error.d.ts').Val<V> } Val */
/**             @typedef { import('./val_or_error.d.ts').Err } Err */

 /** @type { <V>(fn: () => V) => ValOrErr<V> } */
export function eVal(fn) {
  try {
    return asVal(fn())
  } catch (err) {
    return asErr(err)
  }
}

/** @type { <V>(val: V) => ValOrErr<V> } */
export function asVal(val) {
  return { val, err: undefined, getVal: () => val }
}

/** @type { <V>(err: string | Error) => ValOrErr<V> } */
export function asErr(err) {
  /** @type { Error } */
  let theErr
  if (typeof err === 'string') {
    err = new Error(err)
    theErr = err
  } else {
    theErr = err
  }
  return { err: theErr, val: undefined, getErr: () => theErr }
}

/** @type { <V>(o: ValOrErr<V>) => o is Val<V> } */
export function isVal(x) {
  return !!x.val
}

/** @type { <V>(o: ValOrErr<V>) => o is Err } */
export function isErr(x) {
  return !!x.err
}
