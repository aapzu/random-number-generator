import express, { ErrorRequestHandler } from 'express'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'
import cookieSession from 'cookie-session'
import parse from 'parse-duration'
import morgan from 'morgan'
import listItemRoute from './routes/listItemRoute'
import listOrderRoute from './routes/listOrderRoute'
import numberRoute from './routes/numberRoute'
import { ApiError } from './utils/ApiError'
import { parseQueryParams } from './utils/queryParsers'

import swaggerDocs from '../docs/swaggerDoc'

const app = express()

app.set('port', process.env.PORT || 3333)
app.set('query parser', 'simple')
app.use(cors())
app.use(morgan('tiny'))
app.use(express.static(path.resolve(__dirname, '../public')))
app.use(express.static(require.resolve('swagger-ui-dist')))

app.use(
  cookieSession({
    name: 'random-number-generator-session',
    keys: [process.env.SESSION_KEY_1, process.env.SESSION_KEY_2],
    maxAge: 24 * 60 * 60 * 1000
  })
)

app.use((req, _res, next) => {
  const now = Date.now()
  const { clearCache, cacheTime } = parseQueryParams(req.query, ['clearCache', 'cacheTime'])
  if (req.session?.expires === undefined || req.session.expires <= now || clearCache) {
    req.session.randomNumberObject = undefined
    req.session.randomListItemObject = undefined
    req.session.randomListOrderObject = undefined
    const maxAge = cacheTime && parse(cacheTime)
    req.session.expires = maxAge !== undefined ? Date.now() + maxAge : undefined
  }
  next()
})

app.use('/number', numberRoute)
app.use('/listItem', listItemRoute)
app.use('/listOrder', listOrderRoute)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use(((err: ApiError | Error, _req, res, _next) => {
  const status = 'status' in err ? err.status : 500
  res.status(status).json({
    success: false,
    error: err.message
  })
}) as ErrorRequestHandler)

app.listen(app.get('port'), () => {
  console.log(`App listening on port ${app.get('port')}`)
})

export default app
