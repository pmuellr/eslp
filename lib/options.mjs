/**
 * @template V 
 * @typedef { import('./types').ValOrErr<V> } ValOrErr */
/** @typedef { import('./types').Config } Config */
/** @typedef { import('./types').Server  } Server  */

import fs from 'node:fs'
import path from 'node:path'

import meow from 'meow'
import YAML from 'yaml'

import { pkg } from './pkg.mjs'
import { log } from './log.mjs'

const DEFAULT_PORT = 19200

/** @type { Config } */
const BaseConfig = {
  debug: false,
  port: DEFAULT_PORT,
  servers: [
    {
      name: 'local',
      url: 'http://localhost:9200',
      user: 'elastic',
      pass: 'changeme',
    },
    {
      name: 'locals',
      url: 'https://localhost:9200',
      user: 'elastic',
      pass: 'changeme',
    },
  ]
}

/** @type { () => Config } */
export function getConfig() {
  const { args, help, version, debug } = getCliOptions()

  if (help) log.exit(getHelp(), 1)
  
  if (version) {
    console.log(pkg.version)
    process.exit(1)
  }

  const config = readConfig(args[0], debug)
  if (config == undefined) {
    throw new Error('unexpected: config not available')
  }

  return config
}

/** @type { (fileName: string | undefined, debug: boolean) => Config | void } */
function readConfig(fileName, debug) {
  let config

  if (!fileName) {
    config = JSON.parse(JSON.stringify(BaseConfig))
    config.debug = debug
    return config
  }

  const contents = fileContents(fileName)
  if (contents.err) {
    return log.exit(`error reading config file "${fileName}": ${contents.err.message}`, 1)
  }

  const parsed = parseYaml(contents.val)
  if (parsed.err) {
    return log.exit(`error parsing YAML in "${fileName}": ${parsed.err.message}`, 1)
  }

  const validated = validateConfig(parsed.val, debug)
  if (validated.err) {
    return log.exit(`config not valid in "${fileName}": ${validated.err.message}`, 1)
  }

  return validated.val
}

/** @type { (config: any, debug: boolean) => ValOrErr<Config> } */
function validateConfig(config, debug) {
  /** @type { Config } */
  const result = {
    debug,
    port: BaseConfig.port,
    servers: []
  }

  if (config.port !== undefined) {
    if (typeof config.port !== 'number') {
      return { val: undefined, err: new Error('field port must be a number') }
    }
  
    result.port = config.port
  }

  if (config.servers === undefined) {
    result.servers = BaseConfig.servers
  } else  {
    if (typeof config.servers !== 'object') {
      return { val: undefined, err: new Error('field servers must be an object') }
    }

    for (const name of Object.keys(config.servers)) {
      const server = config.servers[name]
      if (typeof server !== 'object') {
        return { val: undefined, err: new Error(`server is not an object: ${JSON.stringify(server)}`) }
      }
      const { url, user = 'elastic', pass = 'changeme' } = server
      if (typeof url !== 'string') {
        return { val: undefined, err: new Error(`url must be a string in server: ${JSON.stringify(server)}`) }
      }
      if (typeof user !== 'string') {
        return { val: undefined, err: new Error(`user must be a string in server: ${JSON.stringify(server)}`) }
      }
      if (typeof pass !== 'string') {
        return { val: undefined, err: new Error(`pass must be a string in server: ${JSON.stringify(server)}`) }
      }

      result.servers.push({ name, url, user, pass })
    }
  }

  return { val: result, err: undefined }
}

/** @type { (yaml: string) => ValOrErr<object> } */
function parseYaml(yaml) {
  try {
    return { val: YAML.parse(yaml), err: undefined }
  } catch (err) {
    return { val: undefined, err: err }
  }
}

/** @type { (fileName: string) => ValOrErr<string> } */
function fileContents(fileName) {
  try {
    return { val: fs.readFileSync(fileName, 'utf-8'), err: undefined }
  } catch (err) {
    return { val: undefined, err: err }
  }
}

function getHelp() {
  const thisFile = new URL(import.meta.url).pathname
  const thisDir = path.dirname(thisFile)
  return fs.readFileSync(`${thisDir}/README.md`, 'utf-8')
}

function getCliOptions() {
  const cliOptions = meow({
    flags: {
      help:    { alias: 'h', type: 'boolean', default: false },
      version: { alias: 'v', type: 'boolean', default: false },
      debug  : { alias: 'd', type: 'boolean', default: false },
    },
    importMeta: import.meta,
  })

  const flags = cliOptions.flags
  return {
    args: cliOptions.input,
    help: flags.help,
    version: flags.version,
    debug: flags.debug,
  }
}