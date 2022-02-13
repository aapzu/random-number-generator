import express, { ErrorRequestHandler, RequestHandler } from 'express'
import { Query } from 'express-serve-static-core'
import { DateTime } from 'luxon'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'
import { ApiError } from './utils/ApiError'
import { generateImage } from './modules/image'
import { getCommonQueryParams, parseStringList } from './utils/queryParsers'
import { generateRandomNumber } from './modules/randomNumberGenerator'
import { SupportedImageFormat, SupportedFont } from './types'

import swaggerDocs from '../docs/swaggerDoc'

const app = express()

app.set('port', process.env.PORT || 3333)

app.set('query parser', 'simple')

app.use(cors())

app.use(express.static(__dirname + '/public'))

const asyncHandler =
  (handler: (...args: Parameters<RequestHandler>) => Promise<ReturnType<RequestHandler>>): RequestHandler =>
  async (req, res, next) => {
    try {
      await handler(req, res, next)
    } catch (err) {
      next(err)
    }
  }

const getJson = (min: number, max: number) => ({
  success: true,
  number: generateRandomNumber(min, max),
  updatedDate: DateTime.now().toFormat('MM.dd.yyyy HH:mm:ss')
})

app.get(
  '/json',
  asyncHandler(async (req, res, next) => {
    const { min, max } = getCommonQueryParams(req.query)
    res.json(getJson(min, max))
  })
)

app.get(
  '/image',
  asyncHandler(async (req, res, next) => {
    const { min, max, ...commonParas } = getCommonQueryParams(req.query)
    const { number, updatedDate } = getJson(min, max)
    const buffer = await generateImage({ ...commonParas, updatedDate, item: number })
    res.contentType(commonParas.imageFormat)
    res.send(buffer)
  })
)

app.get(
  '/imageFromList',
  asyncHandler(async (req, res, next) => {
    const options = parseStringList(req.query.options, 'options', false)
    const commonParas = getCommonQueryParams(req.query)
    const { number, updatedDate } = getJson(0, options.length - 1)
    const buffer = await generateImage({ ...commonParas, updatedDate, item: options[number] })
    res.contentType(commonParas.imageFormat)
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
