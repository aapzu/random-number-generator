import express from 'express'
import { DateTime } from 'luxon'
import { generateImage } from '../modules/image'
import { generateRandomNumber } from '../modules/randomNumberGenerator'
import { RandomListItemJsonResponse, SupportedFormat } from '../types'
import asyncRouteHandler from '../utils/asyncRouteHandler'
import { formatFromContentTypeHeader } from '../utils/headers'
import { parseQueryParams } from '../utils/queryParsers'

const getJson = (items: string[], req: express.Request): RandomListItemJsonResponse =>
  req.session.randomListItemObject || {
    success: true,
    item: items[generateRandomNumber(0, items.length - 1)],
    updatedDate: DateTime.now().toFormat('dd.MM.yyyy HH:mm:ss'),
    cacheExpires: req.session.expires && DateTime.fromMillis(req.session.expires).toFormat('dd.MM.yyyy HH:mm:ss')
  }

const router = express.Router()

router.get(
  '/',
  asyncRouteHandler(async (req, res) => {
    const { items, format, ...imageParams } = parseQueryParams(req.query, [
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
    req.session.randomListItemObject = json
    if (finalFormat === SupportedFormat.Json) {
      res.json(json)
      return
    }
    const buffer = await generateImage({ ...imageParams, ...json, format: finalFormat })
    res.contentType(finalFormat)
    req.session.randomListItemObject = json
    res.send(buffer)
  })
)

export default router
