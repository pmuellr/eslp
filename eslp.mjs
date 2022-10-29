#!/usr/bin/env node

/** @typedef { import('./lib/types').Server } Server */

import Fastify from 'fastify'

import { log } from './lib/log.mjs'
import { getConfig } from './lib/options.mjs'

const fastify = Fastify({
  logger: true
})

const config = getConfig()
log.debug(`config: ${JSON.stringify(config)}`)

const { debug, port, servers } = config

/** @type { Map<string, Server> } */
const serverMap = new Map()
for (const server of servers) {
  serverMap.set(server.name, server)
}

fastify.get('/', async (req, rep) => {
  log(`request ${req.method} ${req.url}`)
  log(`${JSON.stringify(req.headers, null, 4)}`)
  return { hallo: true }
})

start(port)

/** @type { (port: number) => Promise<void> } */
async function start(port) {
  try {
    const address = await fastify.listen({ port, host: 'localhost' })
    log(`server started on ${address}`)
  } catch (err) {
    log.exit(`error starting server: ${err}`, 1)
  }
}
