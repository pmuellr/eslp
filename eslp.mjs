#!/usr/bin/env node

/** @typedef { import('./lib/types').Server } Server */

// import Fastify from 'fastify'

import { log } from './lib/log.mjs'
import { getConfig } from './lib/options.mjs'
import httpProxy from 'http-proxy'

// const fastify = Fastify({
//   logger: true
// })

const config = getConfig()
const { debug, port = 8000, servers } = config
log.debug(`config: ${JSON.stringify(config)}`)

const proxy = httpProxy.createProxyServer({
  target: 'https://elastic:WlscY1Iqj6yLRUKTK0PRLJBq@pmuellr-8-5-0.es.us-central1.gcp.cloud.es.io'
})

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  console.log('headers in: ', req.rawHeaders)
  proxyReq.setHeader('Host', 'pmuellr-8-5-0.es.us-central1.gcp.cloud.es.io')
  req.headers.host = 'pmuellr-8-5-0.es.us-central1.gcp.cloud.es.io'
  console.log('headers out:',req.rawHeaders)
})

proxy.on('error', function(err) {
  console.log('error: ', err)
})

console.log(`proxying on http://localhost:${port}`)
proxy.listen(port)

/** @type { Map<string, Server> } */
const serverMap = new Map()
for (const server of servers) {
  serverMap.set(server.name, server)
}

// fastify.get('/', async (req, rep) => {
//   log(`request ${req.method} ${req.url}`)
//   log(`${JSON.stringify(req.headers, null, 4)}`)
//   return { hallo: true }
// })

// start(port)

/** @type { (port: number) => Promise<void> } */
async function start(port) {
  try {
//    const address = await fastify.listen({ port, host: 'localhost' })
//    log(`server started on ${address}`)
  } catch (err) {
    log.exit(`error starting server: ${err}`, 1)
  }
}
