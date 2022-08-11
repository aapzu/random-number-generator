import {
  defaultParameters,
  imageEndpointDefaultParameters,
  numberJsonSchema,
  parameters,
  responses
} from '../../docs/swaggerDoc'
import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { DateTime } from 'luxon'
import { generateImage } from '../modules/image'
import { generateRandomNumber } from '../modules/randomNumberGenerator'
import { RandomNumberJsonResponse, SupportedFormat } from '../types'
import { contentTypeHeaderFromFormat, formatFromContentTypeHeader } from '../utils/headers'
import { parseQueryParams } from '../utils/queryParsers'

const schema = {
  summary: 'Get a random number in json',
  description: 'Get random number in json',
  operationId: 'getNumberJson',
  produces: ['application/json', 'image/svg+xml', 'image/png', 'image/jpeg'],
  params: [parameters.min, parameters.max, ...defaultParameters, ...imageEndpointDefaultParameters],
  responses: {
    200: {
      description: 'Successfully generated random number image',
      content: {
        'application/json': {
          schema: numberJsonSchema
        },
        'image/jpeg': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        },
        'image/png': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        },
        'image/svg': {
          schema: {
            type: 'string',
            format: ''
          }
        }
      }
    },
    400: responses.invalidParameters
  }
} as const

const getJson = (min: number, max: number, req: FastifyRequest): RandomNumberJsonResponse =>
  req.session.randomNumberObject || {
    success: true,
    number: generateRandomNumber(min, max),
    updatedDate: DateTime.now().toFormat('dd.MM.yyyy HH:mm:ss'),
    cacheExpires: req.session.expires && DateTime.fromMillis(req.session.expires).toFormat('dd.MM.yyyy HH:mm:ss')
  }

const router: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/',
    { schema },
    async (request: FastifyRequest<{ Querystring: Record<string, string | string[]> }>, reply) => {
      const { min, max, format, ...imageParams } = parseQueryParams(request.query, [
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
      const formatFromHeader = formatFromContentTypeHeader(request.headers['content-type'])
      const finalFormat = formatFromHeader || format
      const json = getJson(min, max, request)
      request.session.randomNumberObject = json
      if (finalFormat === SupportedFormat.Json) {
        reply.send(json)
        return
      }
      const buffer = await generateImage({
        ...imageParams,
        updatedDate: json.updatedDate,
        item: json.number,
        format: finalFormat
      })
      reply.header('Content-Type', contentTypeHeaderFromFormat(finalFormat))
      reply.send(buffer)
    }
  )
}

export default router
