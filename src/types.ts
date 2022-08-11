import { Request, RequestHandler } from 'express'

export type RequestWithQuery<Q> = Request<unknown, unknown, unknown, Q>
export type RequestHandlerWithQuery<Q> = RequestHandler<unknown, unknown, unknown, Q>

type BaseJsonResponse = {
  success: boolean
  updatedDate: string
  cacheExpires: string | undefined
}

export type RandomNumberJsonResponse = BaseJsonResponse & {
  number: number
}

export type RandomListItemJsonResponse = BaseJsonResponse & {
  item: string
}

export type RandomListOrderJsonResponse = BaseJsonResponse & {
  items: string[]
}

export enum SupportedFormat {
  Svg = 'image/svg',
  Png = 'image/png',
  Jpeg = 'image/jpeg',
  Json = 'application/json'
}

export enum SupportedFont {
  Roboto = 'Roboto',
  RobotoSerif = 'Roboto-Serif',
  RobotoMono = 'Roboto-Mono',
  RobotoSlab = 'Roboto-Slab',
  RobotoCondensed = 'Roboto-Condensed'
}
