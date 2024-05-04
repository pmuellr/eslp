/** @typedef { import('./types').Server } Server  */
/** @typedef { import('./types').IsServerApiKeyType } IsServerApiKeyType  */
/** @typedef { import('./types').IsServerUserPassType } IsServerUserPassType  */

import { log } from './log.mjs'
import { OUTPUT_ENV, OUTPUT_PLAIN } from './cli.mjs'

/** @type { (port: number, servers: Server[], https: boolean) => Servers } */
export function createServers(port, servers, https) {
  return new Servers(port, servers, https)
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
   * @param {boolean}  https
   */
  constructor(port, servers, https) {
    this.port = port
    this.https = https
    this.replaceServers(servers)
  }

  /** @type { (servers: Server[]) => void } */
  replaceServers(servers) {
    const proto = this.https ? 'https' : 'http'

    this.servers = []
    this.serversByName = new Map()
    this.serversByHost = new Map()

    this.servers = servers.map(server => {
      server.esLocalURL = `${proto}://${server.esLocalHost}:${this.port}`
      server.kbLocalURL = `${proto}://${server.kbLocalHost}:${this.port}`

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

  getHtml() {
    const html = ['<!DOCTYPE html>']
    html.push('<html>')
    html.push('<head><title>eslp proxied servers</title></head>')
    html.push('<h1>eslp proxied servers</h1>')

    const names = this.servers.map(s => s.name)
    for (const name of names) {
      const server = this.serversByName.get(name)
      if (!server) continue

      const { esLocalURL, kbLocalURL } = server
      html.push(`<h2>${name}</h2>`)
      html.push(`<ul>`)
      html.push(`<li><a href="${esLocalURL}">${esLocalURL}</a></li>`)
      html.push(`<li><a href="${kbLocalURL}">${kbLocalURL}</a></li>`)
      html.push(`</ul>`)
    }

    html.push('</html>')
    return html.join('\n')
  }

  getJSON() {
    /** @type { any } */
    const json = { servers: []}

    const names = this.servers.map(s => s.name)
    for (const name of names) {
      const server = this.serversByName.get(name)
      if (!server) continue

      const { esLocalURL: es, kbLocalURL: kb } = server
      json.servers.push({ name, es, kb })
    }

    return json
  }

  /** @type { (type: string) => void } */
  output(type) {
    if (type === OUTPUT_ENV) return this.outputEnv()
    return this.outputPlain()
  }

  outputPlain() {
    log('handling servers:')
    const names = this.servers.map(s => s.name)
    for (const name of names) {
      const server = this.serversByName.get(name)
      if (!server) {
        log(`issue with ${name} ... not in server name map`)
        continue
      }

      const { esLocalURL, kbLocalURL } = server
      console.log('')
      console.log(`${name}`)
      console.log(`  es: ${esLocalURL}`)
      console.log(`  kb: ${kbLocalURL}`)
    }
    console.log('')
  }

  outputEnv() {
    log('handling servers:')

    const names = this.servers.map(s => s.name)
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
