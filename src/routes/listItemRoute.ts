import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { DateTime } from 'luxon'
import { generateImage } from '../modules/image'
import { generateRandomNumber } from '../modules/randomNumberGenerator'
import { RandomListItemJsonResponse, SupportedFormat } from '../types'
import { contentTypeHeaderFromFormat, formatFromContentTypeHeader } from '../utils/headers'
import { parseQueryParams } from '../utils/queryParsers'

const getJson = (items: string[], req: FastifyRequest): RandomListItemJsonResponse =>
  req.session.randomListItemObject || {
    success: true,
    item: items[generateRandomNumber(0, items.length - 1)],
    updatedDate: DateTime.now().toFormat('dd.MM.yyyy HH:mm:ss'),
    cacheExpires: req.session.expires && DateTime.fromMillis(req.session.expires).toFormat('dd.MM.yyyy HH:mm:ss')
  }

const router: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request: FastifyRequest<{ Querystring: Record<string, string | string[]> }>, reply) => {
    const { items, format, ...imageParams } = parseQueryParams(request.query, [
      'items',
      'showUpdatedDate',
      'width',
      'height',
      'font',
      'format',
      'fontColor',
      'bgColor'
    ])
    const formatFromHeader = formatFromContentTypeHeader(request.headers['content-type'])
    const json = getJson(items, request)
    const finalFormat = formatFromHeader || format
    request.session.randomListItemObject = json
    if (finalFormat === SupportedFormat.Json) {
      reply.send(json)
      return
    }
    const buffer = await generateImage({ ...imageParams, ...json, format: finalFormat })
    reply.header('Content-Type', contentTypeHeaderFromFormat(finalFormat))
    request.session.randomListItemObject = json
    reply.send(buffer)
  })
}

export default router
