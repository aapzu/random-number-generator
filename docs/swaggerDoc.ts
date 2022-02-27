import { title } from 'case'
import pjson from '../package.json'
import {
  RandomListItemJsonResponse,
  RandomListOrderJsonResponse,
  RandomNumberJsonResponse,
  SupportedFont,
  SupportedImageFormat
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

const defaultParameters = [parameters.min, parameters.max, parameters.cacheTime] as const

const imageEndpointDefaultParameters = [
  ...defaultParameters,
  parameters.width,
  parameters.height,
  parameters.showUpdatedDate,
  parameters.imageFormat,
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
    '/number/json': {
      get: {
        summary: 'Get random number in json',
        description: 'Get random number in json',
        operationId: 'getNumberJson',
        produces: ['application/json'],
        parameters: [...defaultParameters],
        responses: {
          200: {
            description: 'Successfully generated json',
            schema: numberJsonSchema
          },
          400: responses.invalidParameters
        }
      }
    },
    '/number/image': {
      get: {
        summary: 'Get random number as an image',
        description: 'Get random number as an image',
        operationId: 'getNumberImage',
        produces: ['image/svg+xml', 'image/png', 'image/jpeg'],
        parameters: [...imageEndpointDefaultParameters],
        responses: {
          200: {
            description: 'Successfully generated random number image'
          },
          400: responses.invalidParameters
        }
      }
    },
    '/listItem/json': {
      get: {
        summary: 'Get random list item in json',
        description: 'Get random list item in json',
        operationId: 'getListItemJson',
        produces: ['application/json'],
        parameters: [...defaultParameters, parameters.items],
        responses: {
          200: {
            description: 'Successfully generated json',
            schema: listItemJsonSchema
          },
          400: responses.invalidParameters
        }
      }
    },
    '/listItem/image': {
      get: {
        summary: 'Get random item from a list as an image',
        description: 'Get random item from a list as an image',
        operationId: 'getListItemImage',
        produces: ['image/svg+xml', 'image/png', 'image/jpeg'],
        parameters: [...imageEndpointDefaultParameters, parameters.items],
        responses: {
          200: {
            description: 'Successfully generated image'
          },
          400: responses.invalidParameters
        }
      }
    },
    '/listOrder/json': {
      get: {
        summary: 'Get random list item in json',
        description: 'Get random list order in json',
        operationId: 'getListOrderJson',
        produces: ['application/json'],
        parameters: [...defaultParameters, parameters.items],
        responses: {
          200: {
            description: 'Successfully generated json',
            schema: listOrderJsonSchema
          },
          400: responses.invalidParameters
        }
      }
    },
    '/listOrder/image': {
      get: {
        summary: 'Get random list order as an image',
        description: 'Get random list order as an image',
        operationId: 'getListOrderImage',
        produces: ['image/svg+xml', 'image/png', 'image/jpeg'],
        parameters: [...imageEndpointDefaultParameters, parameters.items, parameters.delimiter],
        responses: {
          200: {
            description: 'Successfully generated image'
          },
          400: responses.invalidParameters
        }
      }
    }
  }
}
