import express from 'express'
import { DateTime } from 'luxon'
import { generateImage } from '../modules/image'
import { generateRandomNumber } from '../modules/randomNumberGenerator'
import { RandomNumberJsonResponse } from '../types'
import asyncRouteHandler from '../utils/asyncRouteHandler'
import { parseQueryParams } from '../utils/queryParsers'

const getJson = (min: number, max: number, req: express.Request): RandomNumberJsonResponse =>
  req.session.randomNumberObject || {
    success: true,
    number: generateRandomNumber(min, max),
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
    const { min, max } = parseQueryParams(req.query, ['min', 'max'])
    const json = getJson(min, max, req)
    req.session.randomNumberObject = json
    res.json(json)
  })
)

router.get(
  '/image',
  asyncRouteHandler(async (req, res) => {
    const { min, max, ...imageParams } = parseQueryParams(req.query, [
      'min',
      'max',
      'showUpdatedDate',
      'width',
      'height',
      'font',
      'imageFormat',
      'fontColor',
      'bgColor'
    ])
    const json = getJson(min, max, req)
    const buffer = await generateImage({
      ...imageParams,
      updatedDate: json.updatedDate,
      item: json.number
    })
    res.contentType(imageParams.imageFormat)
    req.session.randomNumberObject = json
    res.send(buffer)
  })
)

export default router
