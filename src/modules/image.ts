import ejs from 'ejs'
import path from 'path'
import { SupportedImageFormat } from '../types'
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
  imageFormat: SupportedImageFormat
  fontColor: string
  bgColor: string
}

export const generateImage = async ({ imageFormat, ...opts }: GenerateImageOptions): Promise<Buffer> => {
  const svgString = await ejs.renderFile(numberSvgTemplatePath, { ...opts }, {})
  if (imageFormat === SupportedImageFormat.Png) {
    return svgToPng(svgString)
  } else if (imageFormat === SupportedImageFormat.Jpeg) {
    return await svgToJpg(svgString)
  } else if (imageFormat === SupportedImageFormat.Svg) {
    return Buffer.from(await optimizeSvg(svgString), 'utf-8')
  } else {
    throw new ApiError(`Invalid image format: ${imageFormat}`, 400)
  }
}
