import express from 'express'
import { DateTime } from 'luxon'
import { generateImage } from '../modules/image'
import { generateRandomNumber } from '../modules/randomNumberGenerator'
import { RandomListItemJsonResponse } from '../types'
import asyncRouteHandler from '../utils/asyncRouteHandler'
import { parseQueryParams } from '../utils/queryParsers'

const getJson = (items: string[], req: express.Request): RandomListItemJsonResponse =>
  req.session.randomListItemObject || {
    success: true,
    item: items[generateRandomNumber(0, items.length - 1)],
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
    req.session.randomListItemObject = json
    res.json(json)
  })
)

router.get(
  '/image',
  asyncRouteHandler(async (req, res) => {
    const { items, ...imageParams } = parseQueryParams(req.query, [
      'items',
      'showUpdatedDate',
      'width',
      'height',
      'font',
      'imageFormat',
      'fontColor',
      'bgColor'
    ])
    // const { items, ...commonParas } = parseQueryParams(req.query)
    const json = getJson(items, req)
    const buffer = await generateImage({ ...imageParams, ...json })
    res.contentType(imageParams.imageFormat)
    req.session.randomListItemObject = json
    res.send(buffer)
  })
)

export default router
