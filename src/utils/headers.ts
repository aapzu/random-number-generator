import { SupportedFormat } from '../types'

export const formatFromContentTypeHeader = (contentType: string): SupportedFormat | undefined => {
  return {
    'application/json': SupportedFormat.Json,
    'image/png': SupportedFormat.Png,
    'image/jpeg': SupportedFormat.Jpeg,
    'image/svg': SupportedFormat.Svg
  }[contentType]
}

export const contentTypeHeaderFromFormat = (format: SupportedFormat): string => {
  return {
    [SupportedFormat.Json]: 'application/json',
    [SupportedFormat.Png]: 'image/png',
    [SupportedFormat.Jpeg]: 'image/jpeg',
    [SupportedFormat.Svg]: 'image/svg'
  }[format]
}
