#!/usr/bin/env node

import { log } from './lib/log.mjs'
import { getConfig } from './lib/options.mjs'

const config = getConfig()
log.debug(`config: ${JSON.stringify(config)}`)

const { debug, port, servers } = config
