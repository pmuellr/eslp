#!/usr/bin/env node

/** @typedef { import('./lib/types').Server } Server */
/** @typedef { import('./lib/types').Cors } Cors */
/** @typedef { import('./lib/servers.mjs').Servers } Servers */

// import fs from 'node:fs'
import { watch, readFile } from 'node:fs/promises'
import path from 'node:path'
import * as readline from 'node:readline/promises'

import { log } from './lib/log.mjs'
import { pkg } from './lib/pkg.mjs'
import { getCli } from './lib/cli.mjs'
import { startProxy, updateCors } from './lib/proxy.mjs'
import { createServers } from './lib/servers.mjs'
import { advertiseHostNamesViaMDNS } from './lib/m-dns.mjs'
import { getConfig, expandInitialTilde } from './lib/config.mjs'

const DEFAULT_PORT = 19200

main()

async function main() {
  // get cli arguments, read and generate config
  const cli = getCli(process.argv.slice(2))
  const { help, version, debug, configFile: rawConfigFile } = cli
  const configFile = expandInitialTilde(rawConfigFile)

  log.setDebug(!!debug)

  const config = getConfig(configFile)
  const { servers: configServers, fileName: configFileName } = config

  log.debug(`cli: ${JSON.stringify(cli)}`)
  log.debug(`config: ${JSON.stringify(config, redactSecrets)}`)

  // handle flags
  if (help) { console.log(await getHelp()); process.exit(1) }
  if (version) { console.log(pkg.version); process.exit(1) }

  // build data structures
  const port = cli.port || config.port || DEFAULT_PORT
  const servers = createServers(port, configServers, !!config.cert)

  // set up config file re-loaders
  reloadConfigWhenChanged(configFileName, servers, cli.output)
  reloadConfigWhenHumans(configFileName, servers, cli.output)

  // print servers
  servers.output(cli.output)

  // start 'er up!
  start(servers, port, config.cert, config.key, config.cors || {})
}

/** @type { (servers: Servers, port: number, cert: string | undefined, key: string | undefined, cors: Cors) => Promise<void> } */
async function start(servers, port, cert, key, cors) {
  try {
    await startProxy(servers, port, cert, key, cors)
  } catch (err) {
    log.exit(`error starting server: ${err}`, 1)
  }

  advertiseHostNamesViaMDNS(servers)  
}

/** @type { (fileName: string, servers: Servers, outputType: string) => Promise<void> } */
async function reloadConfigWhenChanged(fileName, servers, outputType) {
  try {
    const watcher = watch(fileName)

    for await (const event of watcher) {
      reload(fileName, servers, 'config file changed', outputType)
    }
  } catch (err) {
    log(`error watching config file "${fileName}", not watching for file: ${err}`)
    return
  }
}

/** @type { (fileName: string, servers: Servers, outputType: string) => Promise<void> } */
async function reloadConfigWhenHumans(fileName, servers, outputType) {
  const rl = readline.createInterface({ input: process.stdin })

  rl.on('line', () => reload(fileName, servers, 'humans', outputType))
}

/** @type { (fileName: string, servers: Servers, reason: string, outputType: string) => Promise<void> } */
async function reload(fileName, servers, reason, outputType) {
  const date = new Date().toISOString()
  log(`${date} - reloading config file: ${fileName} because ${reason}`)
  const newConfig = getConfig(fileName)
  servers.replaceServers(newConfig.servers)
  updateCors(newConfig.cors || {})
  servers.output(outputType)
}

/** @type { () => Promise<string> } */
async function getHelp() {
  const thisFile = new URL(import.meta.url).pathname
  const thisDir = path.dirname(thisFile)
  return await readFile(`${thisDir}/README.md`, 'utf-8')
}

/** @type { (key: string, val: any) => any } */
function redactSecrets(key, val) {
  if (key === 'user') return '<** user **>'
  if (key === 'pass') return '<** pass **>'
  if (key === 'apiKey') return '<** apiKey **>'
  return val
}