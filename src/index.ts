import dotenv from 'dotenv'
dotenv.config()

import path from 'node:path'
import Fastify, { FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import fastifySecureSession from '@fastify/secure-session'
import fastifySwagger from '@fastify/swagger'
// import swaggerUi from 'swagger-ui-express'
import parse from 'parse-duration'
import numberRoute from './routes/numberRoute'
import listItemRoute from './routes/listItemRoute'
import listOrderRoute from './routes/listOrderRoute'
// import { ApiError } from './utils/ApiError'
import { parseQueryParams } from './utils/queryParsers'

import swaggerDocs from '../docs/swaggerDoc'

const fastify = Fastify({
  logger: process.env.VERBOSE && process.env.VERBOSE !== 'false'
})

fastify.register(cors)

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333

fastify.register(fastifyStatic, {
  root: path.resolve(__dirname, '../public')
})

fastify.register(fastifySecureSession, {
  cookieName: 'random-number-generator-session',
  secret: process.env.COOKIE_SECRET,
  salt: process.env.COOKIE_SALT,
  cookie: {
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
  }
})

fastify.addHook('preHandler', async (request: FastifyRequest<{ Querystring: Record<string, string | string[]> }>) => {
  const now = Date.now()
  const { clearCache, cacheTime } = parseQueryParams(request.query, ['clearCache', 'cacheTime'])
  if (request.session?.expires === undefined || request.session.expires <= now || clearCache) {
    request.session.randomNumberObject = undefined
    request.session.randomListItemObject = undefined
    request.session.randomListOrderObject = undefined
    const maxAge = cacheTime && parse(cacheTime)
    request.session.expires = maxAge !== undefined ? Date.now() + maxAge : undefined
  }
})

fastify.register(numberRoute, { prefix: '/number' })
fastify.register(listItemRoute, { prefix: '/listItem' })
fastify.register(listOrderRoute, { prefix: '/listOrder' })

fastify.register(fastifySwagger, {
  routePrefix: '/documentation',
  swagger: swaggerDocs,
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true,
  exposeRoute: true
})

// app.get('/*', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// app.use(((err: ApiError | Error, _req, res, _next) => {
//   const status = 'status' in err ? err.status : 500
//   res.status(status).json({
//     success: false,
//     error: err.message
//   })
// }) as ErrorRequestHandler)

fastify.listen({ port }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`App started in ${address}`)
})

export default fastify
