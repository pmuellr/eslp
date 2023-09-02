import { test } from 'node:test'
import assert from 'node:assert/strict'

import { createServers } from './servers.mjs'

test('servers', async (t) => {
  await test('getServers()', (t) => {
    const servers = createServers(42, [])
    assert.deepEqual(servers.getServers(), [])
    assert.deepEqual(servers.getServerByName('x'), undefined)
    assert.deepEqual(servers.getServerByHost('y'), undefined)
  })

  await test('addServer()', (t) => {
    const port = 42
    const esRemoteURL = 'http://example.com/es'
    const kbRemoteURL = 'http://example.com/kb'
  
    const serverToAdd1 = { name: 'a', esLocalHost: 'b', kbLocalHost: 'c', esRemoteURL, kbRemoteURL, apiKey: 'd' }
    const serverToAdd2 = { name: 'z', esLocalHost: 'y', kbLocalHost: 'x', esRemoteURL, kbRemoteURL, user: 'w', pass: 'v' }
    const servers = createServers(port, [serverToAdd1, serverToAdd2])
    
    /** @type { string } */
    let esLocalURL
    /** @type { string } */
    let kbLocalURL

    esLocalURL = `http://${serverToAdd1.esLocalHost}:${port}`
    kbLocalURL = `http://${serverToAdd1.kbLocalHost}:${port}`
    const serverToAdd1After = { ...serverToAdd1, esLocalURL, kbLocalURL }

    esLocalURL = `http://${serverToAdd2.esLocalHost}:${port}`
    kbLocalURL = `http://${serverToAdd2.kbLocalHost}:${port}`
    const serverToAdd2After = { ...serverToAdd2, esLocalURL, kbLocalURL }

    assert.deepEqual(servers.getServers(), [serverToAdd1After, serverToAdd2After])

    assert.deepEqual(servers.getServerByName('a'), serverToAdd1After)
    assert.deepEqual(servers.getServerByHost('b'), serverToAdd1After)
    assert.deepEqual(servers.getServerByHost('c'), serverToAdd1After)

    assert.deepEqual(servers.getServerByName('z'), serverToAdd2After)
    assert.deepEqual(servers.getServerByHost('y'), serverToAdd2After)
    assert.deepEqual(servers.getServerByHost('x'), serverToAdd2After)
  })
})
