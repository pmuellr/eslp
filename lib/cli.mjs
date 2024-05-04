/**
 *  @template V 
 *  @typedef { import('./types').ValOrErr<V> } ValOrErr */
/** @typedef { import('./types').Cli } Cli */

import meow from 'meow'

import { log } from './log.mjs'

export const DEFAULT_CONFIG = '~/.eslp.toml'
export const OUTPUT_PLAIN = 'plain'
export const OUTPUT_ENV   = 'env'

/** @type { (argv: string[]) => Cli } */
export function getCli(argv) {
  const cliOptions = meow({
    argv,
    flags: {
      port:    { shortFlag: 'p', type: 'number' },
      config:  { shortFlag: 'c', type: 'string',  default: DEFAULT_CONFIG},
      debug:   { shortFlag: 'd', type: 'boolean', default: false },
      output:  { shortFlag: 'o', type: 'string',  default: OUTPUT_PLAIN },
      help:    { shortFlag: 'h', type: 'boolean', default: false },
      version: { shortFlag: 'v', type: 'boolean', default: false },
    },
    importMeta: import.meta,
    autoHelp: false,
    autoVersion: false,
  })

  const flags = cliOptions.flags
  const result = {
    port:       flags.port,
    configFile: flags.config,
    help:       !!flags.help,
    version:    !!flags.version,
    debug:      !!flags.debug,
    output:     flags.output
  }
  return result
}