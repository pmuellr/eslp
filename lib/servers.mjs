/** @typedef { import('./types').Server } Server  */
/** @typedef { import('./types').IsServerApiKeyType } IsServerApiKeyType  */
/** @typedef { import('./types').IsServerUserPassType } IsServerUserPassType  */

import { log } from './log.mjs'

/** @type { (port: number, servers: Server[]) => Servers } */
export function createServers(port, servers) {
  return new Servers(port, servers)
}

export class Servers {
  /** @type { Server[] } */
  servers = []
  /** @type { Map<string, Server> } */
  serversByName = new Map()
  /** @type { Map<string, Server> } */
  serversByHost = new Map()

  /** 
   * @param {number}   port
   * @param {Server[]} servers 
   */
  constructor(port, servers) {
    this.port = port
    this.replaceServers(servers)
  }

  /** @type { (servers: Server[]) => void } */
  replaceServers(servers) {
    this.servers = []
    this.serversByName = new Map()
    this.serversByHost = new Map()

    this.servers = servers.map(server => {
      server.esLocalURL = `http://${server.esLocalHost}:${this.port}`
      server.kbLocalURL = `http://${server.kbLocalHost}:${this.port}`

      server = frozenCopy(server)

      this.serversByName.set(server.name,        server)
      this.serversByHost.set(server.esLocalHost, server)
      this.serversByHost.set(server.kbLocalHost, server)
      
      return server
    })
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

  /** @type { (host: string) => string | undefined } */
  getRemoteUrlByHost(host) {
    const server = this.getServerByHost(host)
    if (!server) return

    const { esLocalHost, kbLocalHost, esRemoteURL, kbRemoteURL } = server
    if (host === esLocalHost) return esRemoteURL
    if (host === kbLocalHost) return kbRemoteURL
  }

  /** @type { (host: string) => boolean } */
  isHostKibana(host) {
    for (const server of this.servers) {
      if (host === server.kbLocalHost) return true
    }
    return false
  }

  /** @type { (host: string) => boolean } */
  isHostElasticsearch(host) {
    for (const server of this.servers) {
      if (host === server.esLocalHost) return true
    }
    return false
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
      console.log('')
      console.log(`# ${name}`)
      console.log(`export ES_URL=${esLocalURL}`)
      console.log(`export KB_URL=${kbLocalURL}`)
    }
    console.log('')
  }
}

/** @type { <T>(o: T) => T } */
function frozenCopy(o) {
  return Object.freeze(JSON.parse(JSON.stringify(o)))
}

/** @type { IsServerApiKeyType } */
export function isServerUsingApiKey(server) {
  // @ts-ignore
  return !!server.apiKey
}

/** @type { IsServerUserPassType } */
export function isServerUsingUserPassKey(server) {
  return !isServerUsingApiKey(server)
}
