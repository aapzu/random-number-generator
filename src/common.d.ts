import { RandomListItemJsonResponse, RandomListOrderJsonResponse, RandomNumberJsonResponse } from './types'

declare module 'express-serve-static-core' {
  interface Request {
    session: {
      expires: number
      randomNumberObject?: RandomNumberJsonResponse
      randomListItemObject?: RandomListItemJsonResponse
      randomListOrderObject?: RandomListOrderJsonResponse
    }
  }
}
