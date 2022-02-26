import express, { ErrorRequestHandler, RequestHandler } from 'express'
import { DateTime } from 'luxon'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'
import cookieSession from 'cookie-session'
import parse from 'parse-duration'
import { ApiError } from './utils/ApiError'
import { generateImage } from './modules/image'
import asyncRouteHandler from './utils/asyncRouteHandler'
import { getCommonQueryParams, parseStringList } from './utils/queryParsers'
import { generateRandomNumber } from './modules/randomNumberGenerator'

import swaggerDocs from '../docs/swaggerDoc'

const app = express()

app.set('port', process.env.PORT || 3333)

app.set('query parser', 'simple')

app.use(cors())

app.use(express.static(__dirname + '/public'))

app.use(
  cookieSession({
    name: 'random-number-generator-session',
    keys: [process.env.SESSION_KEY_1, process.env.SESSION_KEY_2],
    maxAge: 24 * 60 * 60 * 1000
  })
)

app.use((req, res, next) => {
  const now = Date.now()
  const { clearCache } = getCommonQueryParams(req.query)
  if (req.session?.expires === undefined || req.session.expires <= now || clearCache) {
    req.session.randomObject = undefined
    const maxAge = typeof req.query.cacheTime === 'string' ? parse(req.query.cacheTime) : undefined
    req.session.expires = maxAge !== undefined ? Date.now() + maxAge : undefined
  }
  next()
})

const getJson = (min: number, max: number, req: express.Request) =>
  req.session.randomObject || {
    success: true,
    number: generateRandomNumber(min, max),
    updatedDate: DateTime.now().toFormat('dd.MM.yyyy HH:mm:ss'),
    cacheExpires: req.session.expires && DateTime.fromMillis(req.session.expires).toFormat('dd.MM.yyyy HH:mm:ss')
  }

app.get(
  '/json',
  asyncRouteHandler(async (req, res, next) => {
    const { min, max } = getCommonQueryParams(req.query)
    const json = getJson(min, max, req)
    req.session.randomObject = json
    res.json(json)
  })
)

app.get(
  '/image',
  asyncRouteHandler(async (req, res, next) => {
    const { min, max, ...commonParas } = getCommonQueryParams(req.query)
    const json = getJson(min, max, req)
    const buffer = await generateImage({
      ...commonParas,
      updatedDate: json.updatedDate,
      item: json.number
    })
    res.contentType(commonParas.imageFormat)
    req.session.randomObject = json
    res.send(buffer)
  })
)

app.get(
  '/imageFromList',
  asyncRouteHandler(async (req, res, next) => {
    const options = parseStringList(req.query.options, 'options', false)
    const commonParas = getCommonQueryParams(req.query)
    const json = getJson(0, options.length - 1, req)
    const buffer = await generateImage({ ...commonParas, updatedDate: json.updatedDate, item: options[json.number] })
    res.contentType(commonParas.imageFormat)
    req.session.randomObject = json
    res.send(buffer)
  })
)

app.get('/*', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use(((err: ApiError | Error, _req, res, _next) => {
  const status = 'status' in err ? err.status : 500
  res.status(status).json({
    success: false,
    error: err.message
  })
}) as ErrorRequestHandler)

app.listen(app.get('port'), () => {
  console.log(`App listening on port ${app.get('port')}`)
})

export default app
