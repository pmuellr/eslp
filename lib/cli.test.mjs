import { test } from 'node:test'
import assert from 'node:assert/strict'

import { getCli } from './cli.mjs'

test('cli', async (t) => {
  await test('getCli()', (t) => {
    const cli = getCli([])
    assert.deepEqual(cli, {
      configFile: '~/.eslp.toml',
      port: undefined,
      help: false,
      version: false,
      debug: false,
    })
  })

  await test('getCli(help)', (t) => {
    const cli = getCli(['--help'])
    assert.deepEqual(cli, {
      configFile: '~/.eslp.toml',
      port: undefined,
      help: true,
      version: false,
      debug: false,
    })
  })

  await test('getCli(version)', (t) => {
    const cli = getCli(['--version'])
    assert.deepEqual(cli, {
      configFile: '~/.eslp.toml',
      port: undefined,
      help: false,
      version: true,
      debug: false,
    })
  })

  await test('getCli(debug)', (t) => {
    const cli = getCli(['--debug'])
    assert.deepEqual(cli, {
      configFile: '~/.eslp.toml',
      port: undefined,
      help: false,
      version: false,
      debug: true,
    })
  })

  await test('getCli(port)', (t) => {
    const cli = getCli(['--port', '1234'])
    assert.deepEqual(cli, {
      port: 1234,
      configFile: '~/.eslp.toml',
      help: false,
      version: false,
      debug: false,
    })
  })

  await test('getCli(config)', (t) => {
    const cli = getCli(['config.toml'])
    assert.deepEqual(cli, {
      port: undefined,
      configFile: 'config.toml',
      help: false,
      version: false,
      debug: false,
    })
  })
})
