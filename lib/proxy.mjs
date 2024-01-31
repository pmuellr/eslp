/** @typedef { import('./types').Server } Server */
/** @typedef { import('./servers.mjs').Servers } Servers */

//import Fastify from 'fastify'
import fs from 'node:fs'
import http, { OutgoingMessage } from 'node:http'
import https from 'node:https'
import httpProxy from 'http-proxy'
import { createDeferred } from './deferred.mjs'
import { ServerResponse, IncomingMessage } from 'node:http'

import { log } from './log.mjs'
import { isServerUsingApiKey } from './servers.mjs'

/** @type { (servers: Servers, port: number, cert: string | undefined, key: string | undefined) => Promise<void> } */
export async function startProxy(servers, port, cert, key) {
  // see: https://www.npmjs.com/package/http-proxy

  /** @type { httpProxy.ServerOptions } */
  const proxyOptions = {
    xfwd: false,
    changeOrigin: true,
  }

  const proxy = httpProxy.createProxyServer(proxyOptions)

  proxy.on('error', function (err, req, res_socket) {
    /** @type { ServerResponse } */
    let res
    // @ts-ignore
    res  = res_socket

    res.writeHead(500, {
      'Content-Type': 'text/plain'
    })
   
    res.end(`error proxying request: ${err.message}`)
    log(`error proxying request: ${err.message}`)
  })

  proxy.on('proxyReq', function(proxyReq, req, res, options) {
    const hostname = getHostnameFromRequest(req)
    if (!hostname) return 

    const server = getServerFromRequest(servers, req)
    if (!server) return

    if (isServerUsingApiKey(server)) {
      proxyReq.setHeader('Authorization', `ApiKey ${server.apiKey}`)
    } else {
      const auth = 'Basic ' + Buffer.from(server.user + ':' + server.pass).toString('base64');
      proxyReq.setHeader('Authorization', auth)
    }
  })

  proxy.on('proxyRes', function (proxyRes, req, res) {
    const host = getHostnameFromRequest(req)
    const message = `${res.statusCode} ${req.method} ${host} ${req.url}`
    log.debug(message)

    proxyRes.headers['Access-Control-Allow-Origin'] = '*'
    res.setHeader('Access-Control-Allow-Origin', '*')
  });

  const proto = cert ? 'https' : 'http'

  /** @type { http.Server | https.Server } */
  let server

  if (cert) {
    server = https.createServer({ cert, key }, requestHandler)
  } else {
    server = http.createServer(requestHandler)
  }

  /** @type { (req: IncomingMessage, res: ServerResponse) => void } */
  function requestHandler(req, res) {
    const hostname = getHostnameFromRequest(req)
    if (!hostname) return httpError(res, `unable to resolve: host header: "${req.headers.host}"`)

    const server = getServerFromRequest(servers, req)
    if (!server) return httpError(res, `unable to resolve server for hostname: "${hostname}"`)

    const remoteURL = servers.getRemoteUrlByHost(hostname)
    if (!remoteURL) return httpError(res, `unable to resolve: no remote url found for: "${hostname}"`)
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {  
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })
      res.end()
      return
    }

    proxy.web(req, res, { target: remoteURL })
  }

  const listenDone = createDeferred()
  try {
    server.listen({ port, host: '127.0.0.1' }, () => {
      log(`server started on ${proto}://localhost:${port}`)
      listenDone.resolve(undefined)
    })
  } catch (err) {
    listenDone.reject(err)
  }

  return listenDone.promise
}

/** @type { (res: ServerResponse, message: string) => void } */
function httpError(res, message) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  })
 
  res.end(message)
  log(`error serving request: ${message}`)
}

/** @type { (servers: Servers, req: IncomingMessage) => Server | undefined} */
function getServerFromRequest(servers, req) {
  const hostname = getHostnameFromRequest(req)
  if (!hostname) return 

  return servers.getServerByHost(hostname)
}

/** @type { (req: IncomingMessage) => string | undefined} */
function getHostnameFromRequest(req) {
  let host = req.headers.host || 'localhost'
  if (!host) return
  if (Array.isArray(host)) host = host[0]

  return host.split(':')[0]
}
