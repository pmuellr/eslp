#!/usr/bin/env node

/** @typedef { import('./lib/types').Server } Server */

import fs from 'node:fs'
import path from 'node:path'
import * as readline from 'node:readline/promises'

import { log } from './lib/log.mjs'
import { pkg } from './lib/pkg.mjs'
import { getCli } from './lib/cli.mjs'
import { startProxy } from './lib/proxy.mjs'
import { getConfig } from './lib/config.mjs'
import { newServers } from './lib/servers.mjs'
import { advertiseHostNamesViaMDNS } from './lib/m-dns.mjs'

const DEFAULT_PORT = 19200

// get cli arguments, read and generate config
const cli = getCli(process.argv.slice(2))
const { help, version, debug, configFile } = cli

log.setDebug(!!debug)
log.debug(`cli: ${JSON.stringify(cli)}`)

const config = getConfig(configFile)
log.debug(`config: ${JSON.stringify(config)}`)
const { servers: configServers } = config

const port = cli.port || config.port || DEFAULT_PORT

// handle flags
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

// build data structures
const servers = newServers(port)
for (const server of configServers) {
  servers.addServer(server)
}

// print the servers, and print again if enter is pressed at stdin
const rl = readline.createInterface({ input: process.stdin })
rl.on('line', servers.dump)
servers.dump()

// start 'er up!
start(port)

/** @type { (port: number) => Promise<void> } */
async function start(port) {
  try {
    await startProxy(port)
  } catch (err) {
    log.exit(`error starting server: ${err}`, 1)
  }

  advertiseHostNamesViaMDNS(servers)  
}

function getHelp() {
  const thisFile = new URL(import.meta.url).pathname
  const thisDir = path.dirname(thisFile)
  return fs.readFileSync(`${thisDir}/README.md`, 'utf-8')
}
