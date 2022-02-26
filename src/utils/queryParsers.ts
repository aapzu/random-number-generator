import { Query } from 'express-serve-static-core'
import parse from 'parse-duration'
import { SupportedFont, SupportedImageFormat } from '../types'
import { ApiError } from './ApiError'

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

type EnumParser = {
  (value: Query[string], enumRef: Record<string, string>, name: string): string | undefined
  (value: Query[string], enumRef: Record<string, string>, name: string, allowMissing: true): string | undefined
  (value: Query[string], enumRef: Record<string, string>, name: string, allowMissing: false): string
}

export const parseEnum: EnumParser = (value, enumRef, name, allowMissing: boolean = true) => {
  const errorString = `Query parameter ${name} must be one of ${Object.values(enumRef).join(', ')}`
  const valueAsString = parseBaseString(value, name, errorString, allowMissing)
  if (typeof valueAsString === 'undefined') {
    return valueAsString
  }
  if (!Object.values(enumRef).includes(valueAsString)) {
    throw new ApiError(errorString, 400)
  }
  return valueAsString
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

export const getCommonQueryParams = (query: Query) => {
  const min = parseNumber(query.min, 'min') || 0
  const max = parseNumber(query.max, 'max') || min + 10
  const width = parseNumber(query.width, 'width') || 500
  const height = parseNumber(query.height, 'height') || width
  const showUpdatedDate = parseBoolean(query.showUpdatedDate, 'showUpdatedDate')
  const clearCache = parseBoolean(query.clearCache, 'clearCache')
  const imageFormat =
    (parseEnum(query.imageFormat, SupportedImageFormat, 'imageFormat') as SupportedImageFormat) ||
    SupportedImageFormat.Png
  const font = (parseEnum(query.font, SupportedFont, 'font') as SupportedFont) || SupportedFont.Roboto
  const fontColor = parseString(query.fontColor, 'fontColor') || '#333'
  const bgColor = parseString(query.bgColor, 'bgColor') || '#fff'
  return { clearCache, min, max, width, height, showUpdatedDate, font, imageFormat, fontColor, bgColor }
}
