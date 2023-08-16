/**
 *  @template V 
 *  @typedef { import('./types').ValOrErr<V> } ValOrErr */
/** @typedef { import('./types').Config } Config */
/** @typedef { import('./types').Server } Server  */

import fs from 'node:fs'
import path from 'node:path'

import toml from 'toml'

import { log } from './log.mjs'
import { eVal, asVal, asErr, isErr } from './val-or-error.mjs'

const DEFAULT_PORT   = 19200

/** @type { (configFile: string) => Config } */
export function getConfig(configFile) {
  const baseConfigFile = getBaseConfigFile()
  const baseConfig = readConfig(baseConfigFile)
  const config = readConfig(configFile)

  /** @type { Config } */
  const finalConfig = {
    debug:   config?.debug || baseConfig?.debug || false,
    port:    config?.port  || baseConfig?.port  || DEFAULT_PORT,
    servers: baseConfig?.servers || []
  }

  for (const server of config?.servers || []) {
    finalConfig.servers.push(server)
  }

  return finalConfig
}

/** @type { (fileName: string) => Config | void } */
export function readConfig(fileName) {
  if (!fs.existsSync(fileName)) return

  const contents = fileContents(fileName)
  if (isErr(contents)) {
    return log.exit(`error reading config file "${fileName}": ${contents.err.message}`, 1)
  }

  const parsed = parseToml(contents.val)
  if (isErr(parsed)) {
    return log.exit(`error parsing TOML in "${fileName}": ${parsed.err.message}`, 1)
  }

  const validated = validateConfig(parsed.val)
  if (isErr(validated)) {
    return log.exit(`config not valid in "${fileName}": ${validated.err.message}`, 1)
  }

  return validated.val
}

/** @type { (config: any) => ValOrErr<Config> } */
export function validateConfig(config) {
  if (typeof config.port !== 'number' && config.port !== undefined) return asErr('config key "port" must be a number')
  if (typeof config.debug !== 'boolean' && config.debug !== undefined) return asErr('config key "debug" must be a boolean')
  
  /** @type { Config } */
  const result = {
    debug: config.debug,
    port: config.port,
    servers: []
  }

  if (!Array.isArray(config.servers)) return asErr('config key "servers" must be an object array')

  for (const server of config.servers) {
    const { name, es, kb, user, pass, apiKey } = server

    if (typeof name !== 'string') return asErr('for servers, config key "name" must be a string')
    if (typeof es   !== 'string') return asErr('for servers, config key "es" must be a string')
    if (typeof kb   !== 'string') return asErr('for servers, config key "kb" must be a string')

    if (user || pass) {
      if (typeof user !== 'string') return asErr('for servers, config key "user" must be a string')
      if (typeof pass !== 'string') return asErr('for servers, config key "pass" must be a string')

      result.servers.push({ name, es, kb, user, pass })
    } else if (apiKey) {
      if (typeof apiKey !== 'string') return asErr('for servers, config key "apiKey" must be a string')

      result.servers.push({ name, es, kb, apiKey })
    } else {
      return asErr('for servers, "user" and "pass", or "apiKey" required')
    }
  }

  return asVal(result)
}

/** @type { (source: string) => ValOrErr<object> } */
function parseToml(source) {
  return eVal(() => toml.parse(source))
}

/** @type { (fileName: string) => ValOrErr<string> } */
function fileContents(fileName) {
  return eVal(() => fs.readFileSync(fileName, 'utf-8'))
}

/** @type { () => string } */
function getBaseConfigFile() {
  const thisFile = new URL(import.meta.url).pathname
  const thisDir = path.dirname(thisFile)
  return `${thisDir}/base-config.toml`
}

