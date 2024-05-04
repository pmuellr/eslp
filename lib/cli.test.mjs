import { test } from 'node:test'
import assert from 'node:assert/strict'

import { getCli } from './cli.mjs'

(async () => { 

  test('cli', async (t) => {
    await test('getCli()', async (t) => {
      const cli = getCli([])
      assert.deepEqual(cli, {
        configFile: '~/.eslp.toml',
        port: undefined,
        help: false,
        version: false,
        debug: false,
        output: 'plain',
      })
    })

    await test('getCli(help)', async (t) => {
      const cli = getCli(['--help'])
      assert.deepEqual(cli, {
        configFile: '~/.eslp.toml',
        port: undefined,
        help: true,
        version: false,
        debug: false,
        output: 'plain',
      })
    })

    await test('getCli(version)', async (t) => {
      const cli = getCli(['--version'])
      assert.deepEqual(cli, {
        configFile: '~/.eslp.toml',
        port: undefined,
        help: false,
        version: true,
        debug: false,
        output: 'plain',
      })
    })

    await test('getCli(debug)', async (t) => {
      const cli = getCli(['--debug'])
      assert.deepEqual(cli, {
        configFile: '~/.eslp.toml',
        port: undefined,
        help: false,
        version: false,
        debug: true,
        output: 'plain',
      })
    })

    await test('getCli(port)', async (t) => {
      const cli = getCli(['--port', '1234'])
      assert.deepEqual(cli, {
        port: 1234,
        configFile: '~/.eslp.toml',
        help: false,
        version: false,
        debug: false,
        output: 'plain',
      })
    })

    await test('getCli(config)', async (t) => {
      const cli = getCli(['--config', 'config.toml'])
      assert.deepEqual(cli, {
        port: undefined,
        configFile: 'config.toml',
        help: false,
        version: false,
        debug: false,
        output: 'plain',
      })
    })

    await test('getCli(output env)', async (t) => {
      const cli = getCli(['--output', 'env'])
      assert.deepEqual(cli, {
        port: undefined,
        configFile: '~/.eslp.toml',
        help: false,
        version: false,
        debug: false,
        output: 'env',
      })
    })
    
  })

})()
