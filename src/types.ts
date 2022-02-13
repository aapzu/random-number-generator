import { Request, RequestHandler } from 'express'

export type RequestWithQuery<Q> = Request<unknown, unknown, unknown, Q>
export type RequestHandlerWithQuery<Q> = RequestHandler<unknown, unknown, unknown, Q>

export enum SupportedImageFormat {
  Svg = 'svg',
  Png = 'png',
  Jpeg = 'jpeg'
}

export enum SupportedFont {
  Roboto = 'Roboto',
  RobotoSerif = 'Roboto Serif',
  RobotoMono = 'Roboto Mono',
  RobotoSlab = 'Roboto Slab'
}
