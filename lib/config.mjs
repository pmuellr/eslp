/**
 *  @template V 
 *  @typedef { import('./types').ValOrErr<V> } ValOrErr */
/** @typedef { import('./types').Config } Config */
/** @typedef { import('./types').Server } Server  */

import fs from 'node:fs'
import os from 'node:os'
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
    debug:    config?.debug || baseConfig?.debug || false,
    port:     config?.port  || baseConfig?.port  || DEFAULT_PORT,
    servers:  baseConfig?.servers || [],
    fileName: configFile,
  }

  for (const server of config?.servers || []) {
    finalConfig.servers.push(server)
  }

  return finalConfig
}

/** @type { (fileName: string) => string } */
export function expandInitialTilde(fileName) {
  return fileName.replace(/^~/, os.homedir())
}

/** @type { (fileName: string) => Config | void } */
export function readConfig(fileName) {
  if (!fs.existsSync(fileName)) {
    log(`config file "${fileName}" not found; ignoring`)
    return
  }

  const stats = fs.statSync(fileName)
  const mode = (stats.mode & parseInt('777', 8)).toString(8)
  if (mode !== '600') {
    log.exit(`config file "${fileName}" must be mode 600, is currently in mode ${mode}`)
  }

  const contents = fileContents(fileName)
  if (isErr(contents)) {
    return log.exit(`error reading config file "${fileName}": ${contents.err.message}`, 1)
  }

  const parsed = parseToml(contents.val)
  if (isErr(parsed)) {
    return log.exit(`error parsing TOML in "${fileName}": ${parsed.err.message}`, 1)
  }

  const validated = validateConfig(fileName, parsed.val)
  if (isErr(validated)) {
    return log.exit(`config not valid in "${fileName}": ${validated.err.message}`, 1)
  }

  return validated.val
}

/** @type { (fileName: string, config: any) => ValOrErr<Config> } */
export function validateConfig(fileName, config) {
  if (typeof config.port !== 'number' && config.port !== undefined) return asErr('config key "port" must be a number')
  if (typeof config.debug !== 'boolean' && config.debug !== undefined) return asErr('config key "debug" must be a boolean')
  
  /** @type { Config } */
  const result = {
    debug: config.debug,
    port: config.port,
    servers: [],
    fileName,
  }

  if (!config.server) {
    return asVal(result)
  }

  if (!Array.isArray(config.server)) return asErr('config key "server" must be an object array')

  for (const server of config.server) {
    const { name, es, kb, user, pass, apiKey } = server

    if (typeof name !== 'string') return asErr('for servers, config key "name" must be a string')
    if (typeof es   !== 'string') return asErr('for server "${name}", config key "es" must be a string')
    if (typeof kb   !== 'string') return asErr('for server "${name}", config key "kb" must be a string')

    const esRemoteURL = es
    const kbRemoteURL = kb
    const esLocalHost = `${name}.es.local`
    const kbLocalHost = `${name}.kb.local`
    const coreConfig = { name, esRemoteURL, kbRemoteURL, esLocalHost, kbLocalHost }

    if (!isValidURL(esRemoteURL)) return asErr(`for server "${name}", config key "es" must be a valid URL`)
    if (!isValidURL(kbRemoteURL)) return asErr(`for server "${name}", config key "kb" must be a valid URL`)

    if (user || pass) {
      if (typeof user !== 'string') return asErr(`for server "${name}", config key "user" must be a string`)
      if (typeof pass !== 'string') return asErr(`for server "${name}", config key "pass" must be a string`)

      result.servers.push({ ...coreConfig, user, pass })
    } else if (apiKey) {
      if (typeof apiKey !== 'string') return asErr(`for server "${name}", config key "apiKey" must be a string`)

      result.servers.push({ ...coreConfig, apiKey })
    } else {
      return asErr(`for server "${name}", "user" and "pass", or "apiKey" required`)
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

/** @type { (url: string) => boolean } */
function isValidURL(url) {
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}