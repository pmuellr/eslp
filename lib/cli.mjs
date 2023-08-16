/**
 *  @template V 
 *  @typedef { import('./types').ValOrErr<V> } ValOrErr */
/** @typedef { import('./types').Cli } Cli */

import meow from 'meow'

const DEFAULT_CONFIG = '~/.eslp.toml'

/** @type { (argv: string[]) => Cli } */
export function getCli(argv) {
  const cliOptions = meow({
    argv,
    flags: {
      port:    { shortFlag: 'p', type: 'number' },
      debug:   { shortFlag: 'd', type: 'boolean', default: false },
      help:    { shortFlag: 'h', type: 'boolean', default: false },
      version: { shortFlag: 'v', type: 'boolean', default: false },
    },
    importMeta: import.meta,
  })

  const flags = cliOptions.flags
  return {
    port: flags.port,
    configFile: cliOptions.input[0] || DEFAULT_CONFIG,
    help: !!flags.help,
    version: !!flags.version,
    debug: !!flags.debug,
  }
}