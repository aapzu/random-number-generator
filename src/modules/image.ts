import ejs from 'ejs'
import path from 'path'
import { SupportedFormat } from '../types'
import { ApiError } from '../utils/ApiError'
import { optimizeSvg, svgToJpg, svgToPng } from '../utils/convertImage'

const numberSvgTemplatePath = path.resolve(__dirname, '../templates/numberSvg.ejs')

type GenerateImageOptions = {
  showUpdatedDate: boolean
  width: number
  height: number
  font: string
  item: string | number
  updatedDate: string
  format: SupportedFormat
  fontColor: string
  bgColor: string
}

export const generateImage = async ({ format, ...opts }: GenerateImageOptions): Promise<Buffer> => {
  const svgString = await ejs.renderFile(numberSvgTemplatePath, { ...opts }, {})
  if (format === SupportedFormat.Png) {
    return svgToPng(svgString, opts.bgColor)
  } else if (format === SupportedFormat.Jpeg) {
    return await svgToJpg(svgString, opts.bgColor)
  } else if (format === SupportedFormat.Svg) {
    return Buffer.from(await optimizeSvg(svgString), 'utf-8')
  } else {
    throw new ApiError(`Invalid image format: ${format}`, 400)
  }
}
