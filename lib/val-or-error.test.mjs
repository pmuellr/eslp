/** @template V @typedef { import('./val-or-error').ValOrErr<V> } ValOrErr */

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { eVal, eValAsync, isVal, isErr, asVal, asErr } from './val-or-error.mjs'

const ErrMessage = '42 test fixture'

      function fnVal()      { return 42 }
async function fnValAsync() { return 42 }
      function fnErr()      { throw new Error(ErrMessage) }
async function fnErrAsync() { throw new Error(ErrMessage) }

(async () => { 
test('val_or_error', async (t) => {

  await test('eVal / isVal / isErr', async (t) => {
    await test('works for values', async (t) => {
      const voe = eVal(fnVal)
      assert.ok(isVal(voe))
      assert.ok(!isErr(voe))
      assert.strictEqual(voe.val, 42)
      // @ts-ignore
      assert.strictEqual(voe.err, undefined)
    })
    
    await test('works for errors', async (t) => {
      const voe = eVal(fnErr)
      assert.ok(!isVal(voe))
      assert.ok(isErr(voe))
      // @ts-ignore
      assert.strictEqual(voe.val, undefined)
      assert.strictEqual(voe.err.message, ErrMessage)
    })
  })

  await test('eValAsync / isVal / isErr', async (t) => {
    await test('works for values', async (t) => {
      const voe = await eValAsync(fnValAsync)
      assert.ok(isVal(voe))
      assert.ok(!isErr(voe))
      assert.strictEqual(voe.val, 42)
      // @ts-expect-error
      assert.strictEqual(voe.err, undefined)
    })
    
    await test('works for errors', async (t) => {
      const voe = await eValAsync(fnErrAsync)
      assert.ok(!isVal(voe))
      assert.ok(isErr(voe))
      // @ts-expect-error
      assert.strictEqual(voe.val, undefined)
      assert.strictEqual(voe.err.message, ErrMessage)
    })
  })

  await test('asVal / isVal / isErr works', async (t) => {
    const voe = asVal(42)
    assert.ok(isVal(voe))
    assert.ok(!isErr(voe))
    assert.strictEqual(voe.val, 42)
    // @ts-expect-error
    assert.strictEqual(voe.err, undefined)
})

  await test('asErrl / isVal / isErr works', async (t) => {
    const voe = asErr(ErrMessage)
    assert.ok(!isVal(voe))
    assert.ok(isErr(voe))
    // @ts-expect-error
    assert.strictEqual(voe.val, undefined)
    assert.strictEqual(voe.err.message, ErrMessage)
  })
})
})()