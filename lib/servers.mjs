/** @typedef { import('./types').Server } Server  */

import { log } from './log.mjs'

/** @type { (port: number) => Servers } */
export function newServers(port) {
  return new Servers(port)
}

export class Servers {
  /** @type { Server[] } */
  servers = []
  /** @type { Map<string, Server> } */
  serversByName = new Map()
  /** @type { Map<string, Server> } */
  serversByHost = new Map()

  /** @param {number} port */
  constructor(port) {
    this.port = port
  }

  /** @type { (server: Server) => void } */
  addServer(server) {
    const esLocalURL = `http://${server.esLocalHost}:${this.port}`
    const kbLocalURL = `http://${server.kbLocalHost}:${this.port}`

    server = frozenCopy({ ...server, esLocalURL, kbLocalURL })

    if (this.serversByName.has(server.name)) {
      log(`server name "${server.name}" already in use, ignoring re-definition`)
      return
    }

    this.servers.push(server)
    this.serversByName.set(server.name,        server)
    this.serversByHost.set(server.esLocalHost, server)
    this.serversByHost.set(server.kbLocalHost, server)
  }

  /** @type { () => Server[] } */
  getServers() {
    return this.servers.slice()
  }

  /** @type { (name: string) => Server | undefined } */
  getServerByName(name) {
    return this.serversByName.get(name)
  }

  /** @type { (host: string) => Server | undefined } */
  getServerByHost(host) {
    return this.serversByHost.get(host)
  }

  dump() {
    log('handling servers:')

    const names = this.servers.map(s => s.name).sort()
    for (const name of names) {
      const server = this.serversByName.get(name)
      if (!server) {
        log(`issue with ${name} ... not in server name map`)
        continue
      }

      const { esLocalURL, kbLocalURL } = server
      log(`   ${name}`)
      log(`      elasticsearch: ${esLocalURL}`)
      log(`      kibana:        ${kbLocalURL}`)
    }
  }
}

/** @type { <T>(o: T) => T } */
function frozenCopy(o) {
  return Object.freeze(JSON.parse(JSON.stringify(o)))
}
