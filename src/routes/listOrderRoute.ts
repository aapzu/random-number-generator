import express from 'express'
import { DateTime } from 'luxon'
import { generateImage } from '../modules/image'
import { RandomListOrderJsonResponse } from '../types'
import asyncRouteHandler from '../utils/asyncRouteHandler'
import { parseQueryParams } from '../utils/queryParsers'

const getJson = (items: string[], req: express.Request): RandomListOrderJsonResponse =>
  req.session.randomListOrderObject || {
    success: true,
    items: items.sort(() => (Math.random() < 0.5 ? -1 : 1)),
    updatedDate: DateTime.now().toFormat('dd.MM.yyyy HH:mm:ss'),
    cacheExpires: req.session.expires && DateTime.fromMillis(req.session.expires).toFormat('dd.MM.yyyy HH:mm:ss')
  }

const router = express.Router()

router.get('/', (req, res) => {
  res.redirect(`${req.baseUrl}/image`)
})

router.get(
  '/json',
  asyncRouteHandler(async (req, res) => {
    const { items } = parseQueryParams(req.query, ['items'])
    const json = getJson(items, req)
    req.session.randomListOrderObject = json
    res.json(json)
  })
)

router.get(
  '/image',
  asyncRouteHandler(async (req, res) => {
    const { items, delimiter, ...imageParams } = parseQueryParams(req.query, [
      'delimiter',
      'items',
      'showUpdatedDate',
      'width',
      'height',
      'font',
      'imageFormat',
      'fontColor',
      'bgColor'
    ])
    const json = getJson(items, req)
    const buffer = await generateImage({
      ...imageParams,
      updatedDate: json.updatedDate,
      item: items.join(delimiter)
    })
    res.contentType(imageParams.imageFormat)
    req.session.randomListOrderObject = json
    res.send(buffer)
  })
)

export default router
