/**
 *  @template V 
 *  @typedef { import('./types').ValOrErr<V> } ValOrErr */

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
  return { val, err: undefined }
}

/** @type { <V>(err: string | Error) => ValOrErr<V> } */
export function asErr(err) {
  if (typeof err === 'string') {
    return { err: new Error(err), val: undefined }
  } else {
    return { err, val: undefined }
  }
}

/** @type { <V>(x: ValOrErr<V>) => boolean } */
export function isVal(x) {
  return !!x.val
}

/** @type { <V>(x: ValOrErr<V>) => boolean } */
export function isErr(x) {
  return !!x.err
}

/** @type { <V>(x: ValOrErr<V>) => V } */
export function getVal(x) {
  if (x.err) throw new Error('not a val')
  return x.val
}

/** @type { <V>(x: ValOrErr<V>) => Error } */
export function getErr(x) {
  if (!x.err) throw new Error('not a val')
  return x.err
}
