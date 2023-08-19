/** @type { () => { promise: Promise<any>, resolve: (val: any) => void, reject:(val: any) => void} } */
export function createDeferred () {
  /** @type { (val: any) => void } */
  let resolver
  /** @type { (err: Error) => void } */
  let rejecter

  const promise = new Promise((resolve, reject) => {
    resolver = resolve
    rejecter = reject
  })

  /** @type { (val: any) => void } */
  function resolve(val) {
    resolver(val)
  }

  /** @type { (err: Error) => void } */
  function reject (err) {
    rejecter(err)
  }

  return { promise, resolve, reject }
}