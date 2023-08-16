#!/usr/bin/env node

/** @typedef { import('./lib/types').Server } Server */

import fs from 'node:fs'
import path from 'node:path'

// import Fastify from 'fastify'

import { log } from './lib/log.mjs'
import { pkg } from './lib/pkg.mjs'
import { getCli } from './lib/cli.mjs'
import { getConfig } from './lib/config.mjs'

// const fastify = Fastify({
//   logger: true
// })

const cli = getCli(process.argv.slice(2))
const { help, version } = cli

const config = getConfig(cli.configFile)
const { debug, port = 8000, servers } = config

if (help) {
  console.log(getHelp())
  process.exit(1)
}

if (version) {
  console.log(pkg.version)
  process.exit(1)
}

log.setDebug(!!debug)
log.debug(`config: ${JSON.stringify(config)}`)

/** @type { Map<string, Server> } */
const serverMap = new Map()

console.log('handling servers:')
for (const server of servers) {
  console.log(`  http://localhost:${port}/s/${server.name}`)
  serverMap.set(server.name, server)
}

// fastify.get('/', async (req, rep) => {
//   log(`request ${req.method} ${req.url}`)
//   log(`${JSON.stringify(req.headers, null, 4)}`)
//   return { hallo: true }
// })

start(port)

/** @type { (port: number) => Promise<void> } */
async function start(port) {
  try {
//    const address = await fastify.listen({ port, host: 'localhost' })
//    log(`server started on ${address}`)
  } catch (err) {
    log.exit(`error starting server: ${err}`, 1)
  }
}

function getHelp() {
  const thisFile = new URL(import.meta.url).pathname
  const thisDir = path.dirname(thisFile)
  return fs.readFileSync(`${thisDir}/README.md`, 'utf-8')
}

