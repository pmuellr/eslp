/** @typedef { import('./servers.mjs').Servers } Servers */
/** @typedef { import('dns-packet').Answer } Answer */
/** @typedef { import('multicast-dns').QueryPacket } QueryPacket */

import mDNS from 'multicast-dns'
import { log } from './log.mjs'

const mdns = mDNS({ 
  multicast: true,
  loopback: true, 
  reuseAddr: true,
})

/** @type { (servers: Servers) => void } */
export function advertiseHostNamesViaMDNS(servers) {
  mdns.on('query', handleMDNSQuery)

  /** @type { (query: QueryPacket) => void } */
  function handleMDNSQuery(query) {

    /** @type { Answer[] } */
    const answers = []
    for (const question of query.questions) {

      log.debug(`mDNS query: ${JSON.stringify(question)}`)
      const { name, type } = question
      if (type !== 'A') continue
      if (!servers.getServerByHost(name)) continue

      log.debug(`mDNS handling A query for ${name}`)
      answers.push({
        name,
        type:  'A',
        ttl:   60 * 1, // 60 sec
        data:  `127.0.0.1`,
        flush: true,
      })
    }

    if (answers.length === 0) return

    log.debug(`mDNS response: ${JSON.stringify(answers)}`)
    mdns.respond({ answers })
  }
}

