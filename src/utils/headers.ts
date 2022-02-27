import { SupportedFormat } from '../types'

export const formatFromContentTypeHeader = (contentType: string): SupportedFormat | undefined => {
  return {
    'application/json': SupportedFormat.Json,
    'image/png': SupportedFormat.Png,
    'image/jpeg': SupportedFormat.Jpeg,
    'image/svg': SupportedFormat.Svg
  }[contentType]
}
