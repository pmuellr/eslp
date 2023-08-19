#!/usr/bin/env node

/** @typedef { import('./lib/types').Server } Server */
/** @typedef { import('./lib/servers.mjs').Servers } Servers */

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

const config = getConfig(configFile)
const { servers: configServers } = config

log.debug(`cli: ${JSON.stringify(cli)}`)
log.debug(`config: ${JSON.stringify(config, redactSecrets)}`)

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
start(servers, port)

/** @type { (servers: Servers, port: number) => Promise<void> } */
async function start(servers, port) {
  try {
    await startProxy(servers, port)
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

/** @type { (key: string, val: any) => any } */
function redactSecrets(key, val) {
  if (key === 'user') return '<** user **>'
  if (key === 'pass') return '<** pass **>'
  if (key === 'apiKey') return '<** apiKey **>'
  return val
}