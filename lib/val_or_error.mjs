/** @template V @typedef { import('./val_or_error.d.ts').ValOrErr<V> } ValOrErr */
/** @template V @typedef { import('./val_or_error.d.ts').Val<V>      } Val */
/**             @typedef { import('./val_or_error.d.ts').Err         } Err */

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
export function asErr(errOrString) {
  const err = getErr(errOrString)
  return { err, val: undefined, getErr: () => err }
}

/** @type { (err: Error | string) => Error } */
function getErr(err) {
  if (typeof err === 'string') return new Error(err)
  return err
}

/** @type { <V>(o: ValOrErr<V>) => o is Val<V> } */
export function isVal(x) {
  return !isErr(x)
}

/** @type { <V>(o: ValOrErr<V>) => o is Err } */
export function isErr(x) {
  return !!x.err
}
