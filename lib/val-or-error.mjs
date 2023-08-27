/** @template V @typedef { import('./val-or-error').Val<V>      } Val */
/** @typedef             { import('./val-or-error').Err         } Err */
/** @template V @typedef { import('./val-or-error').ValOrErr<V> } ValOrErr */

/** 
 * Evaluate a function, returning a ValOrErr wrapper.
 * @type { <V>(fn: () => V) => ValOrErr<V> } 
 */
export function eVal(fn) {
  try {
    return asVal(fn())
  } catch (err) {
    return asErr(err)
  }
}

/** 
 * Evaluate an async function, returning a promise for a ValOrErr wrapper.
 * @type { <V>(fn: () => Promise<V>) => Promise<ValOrErr<V>> } 
 */
export async function eValAsync(fn) {
  try {
    return asVal(await fn())
  } catch (err) {
    return asErr(err)
  }
}

/** 
 * Returns true if the ValOrErr wrapper contains a value.
 * @type { <V>(voe: ValOrErr<V>) => voe is Val<V> } 
 */
export function isVal(x) { return x.isVal }

/** 
 * Returns true if the ValOrErr wrapper contains an error.
 * @type { <V>(voe: ValOrErr<V>) => voe is Err } 
 */
export function isErr(x) { return x.isErr }

/** 
 * Returns a value as a ValOrErr wrapper.
 * @type { <V>(val: V) => ValOrErr<V> } 
 */
export function asVal(val) {
  return { val, ...ValProperties }
}

/** 
 * Returns an error as a ValOrErr wrapper.
 * @type { <V>(errParm: string | Error) => ValOrErr<V> } 
 */
export function asErr(errParm) {
  const err = getError(errParm)
  return { err, ...ErrProperties }
}

const ValProperties = { isVal: true,  isErr: false }
const ErrProperties = { isVal: false, isErr: true  }

/** @type { (err: string | Error) => Error } */
function getError(err) {
  if (typeof err === 'string') {
    return new Error(err)
  } else {
    return err
  }
}

