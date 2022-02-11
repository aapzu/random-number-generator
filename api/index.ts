import ejs from 'ejs'
import express, { ErrorRequestHandler, RequestHandler } from 'express'
import { Query } from 'express-serve-static-core'
import { DateTime } from 'luxon'
import path from 'path'
import { ApiError } from './utils/ApiError'
import { svgToPng } from './utils/convertImage'
import { generateImage } from './modules/image'
import { parseBoolean, parseEnum, parseNumber, parseString, parseStringList } from './utils/queryParsers'
import { generateRandomNumber } from './modules/randomNumberGenerator'
import { Style, SupportedImageFormat } from './types'

const getCommonParams = (query: Query) => {
  const min = parseNumber(query.min, 'min') || 0
  const max = parseNumber(query.max, 'max') || min + 10
  const width = parseNumber(query.width, 'width') || 500
  const height = parseNumber(query.height, 'height') || 500
  const showUpdatedDate = parseBoolean(query.showUpdatedDate, 'showUpdatedDate')
  const imageFormat =
    (parseEnum(query.imageFormat, SupportedImageFormat, 'imageFormat') as SupportedImageFormat) ||
    SupportedImageFormat.Png
  const font = parseString(query.font, 'font') || 'Arial'
  const style = (parseEnum(query.style, Style, 'style') as Style) || Style.Light
  const fontColor = parseString(query.fontColor, 'fontColor') || style === Style.Light ? '#333' : '#fff'
  const bgColor = parseString(query.bgColor, 'bgColor') || style === Style.Light ? '#fff' : '#333'
  return { min, max, width, height, showUpdatedDate, font, imageFormat, style, fontColor, bgColor }
}

const app = express()

app.set('port', process.env.PORT || 3333)

app.set('query parser', 'simple')

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
  '/',
  asyncHandler(async (req, res, next) => {
    const { min, max } = getCommonParams(req.query)
    res.json(getJson(min, max))
  })
)

app.get(
  '/image',
  asyncHandler(async (req, res, next) => {
    const { min, max, ...commonParas } = getCommonParams(req.query)
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
    const commonParas = getCommonParams(req.query)
    const { number, updatedDate } = getJson(0, options.length - 1)
    const buffer = await generateImage({ ...commonParas, updatedDate, item: options[number] })
    res.contentType(commonParas.imageFormat)
    res.send(buffer)
  })
)

const errorHandler: ErrorRequestHandler = (err: ApiError | Error, _req, res, _next) => {
  const status = 'status' in err ? err.status : 500
  res.status(status).json({
    success: false,
    error: err.message
  })
}
app.use(errorHandler)

app.listen(app.get('port'), () => {
  console.log(`App listening on port ${app.get('port')}`)
})

export default app
