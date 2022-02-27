import { title } from 'case'
import pjson from '../package.json'
import {
  RandomListItemJsonResponse,
  RandomListOrderJsonResponse,
  RandomNumberJsonResponse,
  SupportedFont,
  SupportedFormat
} from '../src/types'
import { QueryParams } from '../src/utils/queryParsers'

type SwaggerTypeObject<T extends string> = { type: T; [key: string]: unknown }

type SwaggerString = SwaggerTypeObject<'string'>
type SwaggerBoolean = SwaggerTypeObject<'boolean'>
type SwaggerNumber = SwaggerTypeObject<'number'>
type SwaggerUnknown = SwaggerTypeObject<string>

type SwaggerArray<T extends Array<any>> = SwaggerTypeObject<'array'> & {
  items: T extends Array<infer U> ? SwaggerSchema<U> : SwaggerSchema<any>
}

type SwaggerObject<T extends Record<string, unknown>> = SwaggerTypeObject<'object'> & {
  properties: {
    [K in keyof T]: SwaggerSchema<T[K]>
  }
}

type SwaggerSchema<T> = T extends Array<any>
  ? SwaggerArray<T>
  : T extends Record<string, any>
  ? SwaggerObject<T>
  : T extends string
  ? SwaggerString
  : T extends boolean
  ? SwaggerBoolean
  : T extends number
  ? SwaggerNumber
  : SwaggerUnknown

type QueryParameters = {
  [K in keyof QueryParams]: { name: K; in: 'query'; description: string; required: boolean } & SwaggerSchema<
    QueryParams[K]
  >
}

const parameters: QueryParameters = {
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
  cacheTime: {
    name: 'cacheTime',
    in: 'query',
    description: 'Time to cache the current random number. Given in human readable duration format (eg. 1min, 2d)',
    required: false,
    type: 'string'
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
  format: {
    name: 'format',
    in: 'query',
    description: 'Format of the returned payload',
    required: false,
    type: 'string',
    enum: Object.values(SupportedFormat),
    default: SupportedFormat.Jpeg
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
  },
  items: {
    name: 'items',
    description: 'List items',
    required: true,
    in: 'query',
    type: 'array',
    items: {
      type: 'string'
    }
  },
  clearCache: {
    name: 'clearCache',
    in: 'query',
    description: 'Force cache clear',
    required: false,
    type: 'boolean',
    default: false
  },
  delimiter: {
    name: 'delimiter',
    in: 'query',
    description: 'Delimiter of the list items',
    required: false,
    type: 'string',
    default: ', '
  }
}

const defaultParameters = [parameters.cacheTime] as const

const imageEndpointDefaultParameters = [
  parameters.width,
  parameters.height,
  parameters.showUpdatedDate,
  parameters.format,
  parameters.font,
  parameters.fontColor,
  parameters.bgColor
] as const

const responses = {
  invalidParameters: {
    description: 'Invalid parameters',
    schema: {
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
} as const

const numberJsonSchema: SwaggerObject<RandomNumberJsonResponse> = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean'
    },
    number: {
      type: 'number'
    },
    updatedDate: {
      type: 'string'
    },
    cacheExpires: {
      type: 'string'
    }
  }
}

const listItemJsonSchema: SwaggerObject<RandomListItemJsonResponse> = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean'
    },
    item: {
      type: 'string'
    },
    updatedDate: {
      type: 'string'
    },
    cacheExpires: {
      type: 'string'
    }
  }
}

const listOrderJsonSchema: SwaggerObject<RandomListOrderJsonResponse> = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean'
    },
    items: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    updatedDate: {
      type: 'string'
    },
    cacheExpires: {
      type: 'string'
    }
  }
}

// TODO: strongly type the config
export default {
  openapi: '3.0.0',
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
    '/number': {
      get: {
        summary: 'Get a random number in json',
        description: 'Get random number in json',
        operationId: 'getNumberJson',
        produces: ['application/json', 'image/svg+xml', 'image/png', 'image/jpeg'],
        parameters: [parameters.min, parameters.max, ...defaultParameters],
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
      }
    },
    '/listItem': {
      get: {
        summary: 'Get random item from a list as an image',
        description: 'Get random item from a list as an image',
        operationId: 'getListItemImage',
        produces: ['application/json', 'image/svg+xml', 'image/png', 'image/jpeg'],
        parameters: [...imageEndpointDefaultParameters, parameters.items],
        responses: {
          200: {
            description: 'Successfully generated image',
            produces: ['image/svg', 'image/png', 'image/jpeg', 'application/json'],
            content: {
              'application/json': {
                schema: listItemJsonSchema
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
      }
    },
    '/listOrder': {
      get: {
        summary: 'Get random list order',
        description: 'Get random list order',
        operationId: 'getListOrder',
        produces: ['application/json', 'image/svg+xml', 'image/png', 'image/jpeg'],
        parameters: [...imageEndpointDefaultParameters, parameters.items, parameters.delimiter],
        responses: {
          200: {
            description: 'Successfully generated random list order',
            content: {
              'application/json': {
                schema: listOrderJsonSchema
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
      }
    }
  }
}
