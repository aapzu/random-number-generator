import express from 'express'
import { DateTime } from 'luxon'
import { generateImage } from '../modules/image'
import { RandomListOrderJsonResponse, SupportedFormat } from '../types'
import asyncRouteHandler from '../utils/asyncRouteHandler'
import { formatFromContentTypeHeader } from '../utils/headers'
import { parseQueryParams } from '../utils/queryParsers'

const getJson = (items: string[], req: express.Request): RandomListOrderJsonResponse =>
  req.session.randomListOrderObject || {
    success: true,
    items: items.sort(() => (Math.random() < 0.5 ? -1 : 1)),
    updatedDate: DateTime.now().toFormat('dd.MM.yyyy HH:mm:ss'),
    cacheExpires: req.session.expires && DateTime.fromMillis(req.session.expires).toFormat('dd.MM.yyyy HH:mm:ss')
  }

const router = express.Router()

router.get(
  '/',
  asyncRouteHandler(async (req, res) => {
    const { items, delimiter, format, ...imageParams } = parseQueryParams(req.query, [
      'delimiter',
      'items',
      'showUpdatedDate',
      'width',
      'height',
      'font',
      'format',
      'fontColor',
      'bgColor'
    ])
    const formatFromHeader = formatFromContentTypeHeader(req.header('content-type'))
    const json = getJson(items, req)
    const finalFormat = formatFromHeader || format
    req.session.randomListOrderObject = json
    if (finalFormat === SupportedFormat.Json) {
      res.json(json)
      return
    }
    const buffer = await generateImage({
      ...imageParams,
      updatedDate: json.updatedDate,
      item: items.join(delimiter),
      format: finalFormat
    })
    res.contentType(finalFormat)
    res.send(buffer)
  })
)

export default router
