import express from 'express'
import { DateTime } from 'luxon'
import { generateImage } from '../modules/image'
import { generateRandomNumber } from '../modules/randomNumberGenerator'
import { RandomNumberJsonResponse, SupportedFormat } from '../types'
import asyncRouteHandler from '../utils/asyncRouteHandler'
import { formatFromContentTypeHeader } from '../utils/headers'
import { parseQueryParams } from '../utils/queryParsers'

const getJson = (min: number, max: number, req: express.Request): RandomNumberJsonResponse =>
  req.session.randomNumberObject || {
    success: true,
    number: generateRandomNumber(min, max),
    updatedDate: DateTime.now().toFormat('dd.MM.yyyy HH:mm:ss'),
    cacheExpires: req.session.expires && DateTime.fromMillis(req.session.expires).toFormat('dd.MM.yyyy HH:mm:ss')
  }

const router = express.Router()

router.get(
  '/',
  asyncRouteHandler(async (req, res) => {
    const { min, max, format, ...imageParams } = parseQueryParams(req.query, [
      'min',
      'max',
      'showUpdatedDate',
      'width',
      'height',
      'font',
      'format',
      'fontColor',
      'bgColor'
    ])
    const formatFromHeader = formatFromContentTypeHeader(req.header('content-type'))
    const finalFormat = formatFromHeader || format
    const json = getJson(min, max, req)
    req.session.randomNumberObject = json
    if (finalFormat === SupportedFormat.Json) {
      res.json(json)
      return
    }
    const buffer = await generateImage({
      ...imageParams,
      updatedDate: json.updatedDate,
      item: json.number,
      format: finalFormat
    })
    res.contentType(finalFormat)
    res.send(buffer)
  })
)

export default router
