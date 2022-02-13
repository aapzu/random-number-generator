import { title } from 'case'
import pjson from '../package.json'
import { SupportedFont, SupportedImageFormat } from '../src/types'

const parameters = {
  min: {
    name: 'min',
    in: 'query',
    description: 'Minimum value of the random number',
    required: false,
    type: 'number',
    default: 0
  },
  max: {
    name: 'max',
    in: 'query',
    description: 'Maximum value of the random number',
    required: false,
    type: 'number',
    default: 10
  },
  width: {
    name: 'width',
    in: 'query',
    description: 'Width of the produced image',
    required: false,
    type: 'number',
    default: 500
  },
  height: {
    name: 'height',
    in: 'query',
    description: 'Height of the produced image',
    required: false,
    type: 'number',
    default: 500
  },
  showUpdatedDate: {
    name: 'showUpdatedDate',
    in: 'query',
    description: 'If the image should show the date when it was last updated',
    required: false,
    type: 'boolean',
    default: false
  },
  imageFormat: {
    name: 'imageFormat',
    in: 'query',
    description: 'Format of the returned image',
    required: false,
    type: 'string',
    enum: Object.values(SupportedImageFormat),
    default: SupportedImageFormat.Jpeg
  },
  font: {
    name: 'font',
    in: 'query',
    description: 'Font to use in the output. Must be a system font.',
    required: false,
    type: 'string',
    enum: Object.values(SupportedFont),
    default: SupportedFont.Roboto
  },
  fontColor: {
    name: 'fontColor',
    in: 'query',
    description: 'Color of the font',
    required: false,
    type: 'string',
    default: '#333'
  },
  bgColor: {
    name: 'bgColor',
    in: 'query',
    description: 'Background color',
    required: false,
    type: 'string',
    default: '#fff'
  }
} as const

const responses = {
  invalidParameters: {
    description: 'Invalid parameters',
    schema: {
      $ref: '#/definitions/ErrorResponse'
    }
  }
} as const

// TODO: strongly type the config
export default {
  swagger: '2.0',
  info: {
    description: pjson.description,
    version: pjson.version,
    title: title(pjson.name),
    contact: pjson.author,
    license: {
      name: pjson.license
    }
  },
  host: process.env.VERCEL_URL || 'random-number-generator-aapzu.vercel.app',
  basePath: '/',
  schemes: ['https'],
  paths: {
    '/json': {
      get: {
        summary: 'Get random number in json',
        description: 'Get random number in json',
        operationId: 'getJson',
        produces: ['application/json'],
        parameters: [parameters.min, parameters.max],
        responses: {
          200: {
            description: 'Successfully generated image'
          },
          400: responses.invalidParameters
        }
      }
    },
    '/image': {
      get: {
        summary: 'Get random number as an image',
        description: 'Get random number as an image',
        operationId: 'getImage',
        produces: ['image/svg+xml', 'image/png', 'image/jpeg'],
        parameters: [
          parameters.min,
          parameters.max,
          parameters.width,
          parameters.height,
          parameters.showUpdatedDate,
          parameters.imageFormat,
          parameters.font,
          parameters.fontColor,
          parameters.bgColor
        ],
        responses: {
          200: {
            description: 'Successfully generated random number',
            schema: {
              type: 'object',
              properties: {
                number: {
                  type: 'integer'
                },
                success: {
                  type: 'boolean'
                },
                updatedDate: {
                  type: 'string'
                }
              }
            }
          },
          400: {
            description: 'Invalid parameters',
            schema: {
              $ref: '#/definitions/ErrorResponse'
            }
          }
        }
      }
    },
    '/imageFromList': {
      get: {
        summary: 'Get random item from a list as an image',
        description: 'Get random item from a list as an image',
        operationId: 'getImageFromList',
        produces: ['image/svg+xml', 'image/png', 'image/jpeg'],
        parameters: [
          {
            name: 'options',
            in: 'query',
            required: true,
            type: 'array',
            items: {
              type: 'string'
            }
          },
          parameters.width,
          parameters.height,
          parameters.showUpdatedDate,
          parameters.imageFormat,
          parameters.font,
          parameters.fontColor,
          parameters.bgColor
        ],
        responses: {
          200: {
            description: 'Successfully generated image'
          },
          400: responses.invalidParameters
        }
      }
    }
  },
  definitions: {
    ErrorResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean'
        },
        error: {
          type: 'string'
        }
      }
    }
  }
}
