import express, { ErrorRequestHandler, Request } from 'express'
import path from 'path'
import { DateTime } from 'luxon'
import ejs from 'ejs'

const numberSvgTemplatePath = path.resolve(__dirname, '../templates/numberSvg.ejs')

const port = process.env.PORT || 3333

const app = express()

const generateRandomNumber = (from: number, to: number) => {
  if (from > to) {
    throw new Error(`from cannot be bigger than to! from: ${from}, to: ${to}`)
  }
  return Math.floor(Math.random() * (to + 1)) + from
}

const getJson = (from: number, to: number) => ({
  success: true,
  number: generateRandomNumber(from, to),
  updatedDate: DateTime.now().toFormat('MM.dd.yyyy HH:mm:ss')
})

app.get('/', async (req: Request<{}, {}, {}, { from?: number; to?: number; showUpdatedDate?: boolean }>, res, next) => {
  const { from = 0, to = from + 10, showUpdatedDate = false } = req.query
  try {
    res.json(getJson(from, to))
  } catch (err) {
    return next(err)
  }
})

type ImageRouteQuery = { from?: number; to?: number; showUpdatedDate?: boolean; width?: number; height?: number }
app.get('/image', async (req: Request<{}, {}, {}, ImageRouteQuery>, res, next) => {
  const { from = 0, to = from + 10, showUpdatedDate = false, width = 300, height = 300 } = req.query
  try {
    const { number, updatedDate } = getJson(from, to)
    const svgString = await ejs.renderFile(
      numberSvgTemplatePath,
      {
        showUpdatedDate,
        width,
        height,
        item: number,
        currentDate: updatedDate
      },
      {}
    )
    res.send(svgString)
  } catch (err) {
    return next(err)
  }
})

type ImageFromListRouteQuery = {
  options: string | string[]
  showUpdatedDate?: boolean
  width?: number
  height?: number
}
app.get('/imageFromList', async (req: Request<{}, {}, {}, ImageFromListRouteQuery>, res, next) => {
  const { options, showUpdatedDate = false, width = 300, height = 300 } = req.query
  try {
    if (!options) {
      throw new Error('no options given')
    }
    const optionsList = !Array.isArray(options) ? [options] : options
    const { number, updatedDate } = getJson(0, optionsList.length - 1)
    const svgString = await ejs.renderFile(
      numberSvgTemplatePath,
      {
        showUpdatedDate,
        width,
        height,
        item: optionsList[number],
        currentDate: updatedDate
      },
      {}
    )
    res.send(svgString)
  } catch (err) {
    return next(err)
  }
})

const errorHandler: ErrorRequestHandler = (err: Error, _req, res, _next) => {
  res.status(500).json({
    success: false,
    error: err.message
  })
}
app.use(errorHandler)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
