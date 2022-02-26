import { RequestHandler } from 'express'

const asyncRouteHandler =
  (handler: (...args: Parameters<RequestHandler>) => Promise<ReturnType<RequestHandler>>): RequestHandler =>
  async (req, res, next) => {
    try {
      await handler(req, res, next)
    } catch (err) {
      next(err)
    }
  }

export default asyncRouteHandler
