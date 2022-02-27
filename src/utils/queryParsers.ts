import { Query } from 'express-serve-static-core'
import parse from 'parse-duration'
import { SupportedFont, SupportedFormat } from '../types'
import { ApiError } from './ApiError'
import { pick } from 'lodash'

type Parser<T> = {
  (value: Query[string], name: string, allowMissing?: boolean): T | undefined
  (value: Query[string], name: string, allowMissing: false): T
}

const parseBaseString = (value: Query[string], name: string, errorString: string, allowMissing = true) => {
  if (value === undefined || value === null) {
    if (!allowMissing) {
      throw new ApiError(`Query parameter ${name} is missing`, 400)
    }
    return undefined
  }
  if (typeof value === 'string') {
    return value
  } else {
    throw new ApiError(errorString, 400)
  }
}

export const parseString: Parser<string> = (value, name, allowMissing = true) => {
  return parseBaseString(value, name, `Query parameter ${name} must be a string`, allowMissing)
}

export const parseNumber: Parser<number> = (value, name, allowMissing = true) => {
  const valueAsString = parseBaseString(value, name, `Query parameter ${name} must be a number`, allowMissing)
  if (typeof valueAsString === 'undefined') {
    return valueAsString
  }
  const parsedNumber = parseFloat(valueAsString)
  if (parsedNumber.toString() !== valueAsString) {
    throw new ApiError(`Query parameter ${name} must be a valid number`, 400)
  }
  return parsedNumber
}

export const parseBoolean: Parser<boolean> = (value, name, allowMissing = true) => {
  const valueAsString = parseBaseString(value, name, `Query parameter ${name} must be a boolean`, allowMissing)
  if (typeof valueAsString === 'undefined') {
    return valueAsString
  }
  return typeof valueAsString === 'string' && valueAsString !== 'false'
}

export const parseStringList: Parser<string[]> = (value, name, allowMissing = true) => {
  if (value === undefined || value === null) {
    if (!allowMissing) {
      throw new ApiError(`Query parameter ${name} is missing`, 400)
    }
    return undefined
  }
  if (typeof value === 'string') {
    return [value]
  } else if (Array.isArray(value) && !value.some((item) => typeof item !== 'string')) {
    return value as string[]
  } else {
    throw new ApiError(`Query parameter ${name} must be a string or a string list`, 400)
  }
}

export function parseEnum<E extends Record<string, string>>(
  value: Query[string],
  enumRef: E,
  name: string,
  allowMissing?: boolean
): E[keyof E] {
  const errorString = `Query parameter ${name} must be one of ${Object.values(enumRef).join(', ')}`
  const valueAsString = parseBaseString(value, name, errorString, allowMissing)
  if (typeof valueAsString === 'undefined') {
    return valueAsString
  }
  if (!Object.values(enumRef).includes(valueAsString)) {
    throw new ApiError(errorString, 400)
  }
  return valueAsString as E[keyof E]
}

export const parseDuration: Parser<number> = (value, name, allowMissing = true) => {
  const errorString = `Query parameter ${name} must be a duration, eg. 1sec, 10min or 1d`
  const valueAsString = parseBaseString(value, name, errorString, allowMissing)
  if (typeof valueAsString === 'undefined') {
    return valueAsString
  }
  const duration = parse(valueAsString)
  if (duration === null) {
    throw new ApiError(errorString, 400)
  }
  return duration
}

export type QueryParams = {
  clearCache?: boolean
  min?: number
  max?: number
  width?: number
  height?: number
  showUpdatedDate?: boolean
  font?: SupportedFont
  format?: SupportedFormat
  fontColor?: string
  bgColor?: string
  items?: Array<string>
  delimiter?: string
  cacheTime?: string
}

export const parseQueryParams = <K extends (keyof QueryParams)[]>(
  query: Query,
  keys: K
): Required<Pick<QueryParams, K[number]>> => {
  const test = (k: keyof QueryParams) => keys.includes(k) || undefined

  const min = test('min') && (parseNumber(query.min, 'min') || 0)
  const max = test('max') && (parseNumber(query.max, 'max') || min + 10)
  const width = test('width') && (parseNumber(query.width, 'width') || 500)
  const height = test('height') && (parseNumber(query.height, 'height') || width)
  const showUpdatedDate = test('showUpdatedDate') && parseBoolean(query.showUpdatedDate, 'showUpdatedDate')
  const clearCache = test('clearCache') && parseBoolean(query.clearCache, 'clearCache')
  const format = test('format') && (parseEnum(query.format, SupportedFormat, 'format') || SupportedFormat.Png)
  const font = test('font') && (parseEnum(query.font, SupportedFont, 'font') || SupportedFont.Roboto)
  const fontColor = test('fontColor') && (parseString(query.fontColor, 'fontColor') || '#333')
  const bgColor = test('bgColor') && (parseString(query.bgColor, 'bgColor') || '#fff')
  const items = test('items') && parseStringList(query.items, 'items', false)
  const delimiter = test('delimiter') && (parseString(query.delimiter, 'delimiter', true) || ', ')
  const cacheTime = test('cacheTime') && parseDuration(query.cacheTime, 'cacheTime', true)
  return pick(
    {
      clearCache,
      min,
      max,
      width,
      height,
      showUpdatedDate,
      font,
      format,
      fontColor,
      bgColor,
      items,
      delimiter,
      cacheTime
    },
    keys
    // TODO: fix this
  ) as unknown as Required<Pick<QueryParams, K[number]>>
}
