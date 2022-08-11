import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { DateTime } from 'luxon'
import { generateImage } from '../modules/image'
import { RandomListOrderJsonResponse, SupportedFormat } from '../types'
import { contentTypeHeaderFromFormat, formatFromContentTypeHeader } from '../utils/headers'
import { parseQueryParams } from '../utils/queryParsers'

const getJson = (items: string[], req: FastifyRequest): RandomListOrderJsonResponse =>
  req.session.randomListOrderObject || {
    success: true,
    items: items.sort(() => (Math.random() < 0.5 ? -1 : 1)),
    updatedDate: DateTime.now().toFormat('dd.MM.yyyy HH:mm:ss'),
    cacheExpires: req.session.expires && DateTime.fromMillis(req.session.expires).toFormat('dd.MM.yyyy HH:mm:ss')
  }

const router: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request: FastifyRequest<{ Querystring: Record<string, string | string[]> }>, reply) => {
    const { items, delimiter, format, ...imageParams } = parseQueryParams(request.query, [
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
    const formatFromHeader = formatFromContentTypeHeader(request.headers['content-type'])
    const json = getJson(items, request)
    const finalFormat = formatFromHeader || format
    request.session.randomListOrderObject = json
    if (finalFormat === SupportedFormat.Json) {
      reply.send(json)
      return
    }
    const buffer = await generateImage({
      ...imageParams,
      updatedDate: json.updatedDate,
      item: items.join(delimiter),
      format: finalFormat
    })
    reply.header('Content-Type', contentTypeHeaderFromFormat(finalFormat))
    reply.send(buffer)
  })
}

export default router
