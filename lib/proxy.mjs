import Fastify from 'fastify'

import { log } from './log.mjs'

/** @type { (port: number) => Promise<void> } */
export async function startProxy(port) {
  const fastify = Fastify({
    logger: false
  })

  fastify.get('/', async (req, rep) => {
    log(`request ${req.method} ${req.url}`)
    log(`${JSON.stringify(req.headers, null, 4)}`)
    return { hallo: true }
  })

  try {
    const address = await fastify.listen({ port, host: '127.0.0.1' })
    log(`server started on http://localhost:${port}`)
  } catch (err) {
    log.exit(`error starting server: ${err}`, 1)
  }
}
