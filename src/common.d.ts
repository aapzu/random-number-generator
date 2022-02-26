import * as Express from 'express'
import { DateTime } from 'luxon'
import { generateRandomNumber } from './modules/randomNumberGenerator'

declare module 'express-serve-static-core' {
  interface Request extends Express.Request {
    session: {
      expires: number
      randomObject: {
        success: boolean
        number: number
        updatedDate: string
      }
    }
  }
}
