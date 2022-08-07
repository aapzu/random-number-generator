import { Resvg } from '@resvg/resvg-js'
import { optimize } from 'svgo'
import jimp from 'jimp'
import path from 'path'

export const optimizeSvg = async (svgString: string) => {
  const optimizeResult = await optimize(svgString)
  if ('data' in optimizeResult) {
    return optimizeResult.data
  } else {
    throw optimizeResult.modernError
  }
}

export const svgToPng = async (svgString: string, bgColor: string) => {
  const optimizedSvg = await optimizeSvg(svgString)
  const resvg = new Resvg(optimizedSvg, {
    fitTo: {
      mode: 'original'
    },
    font: {
      fontDirs: [path.resolve(__dirname, '../../public/fonts')],
      defaultFontFamily: 'Roboto Mono',
      loadSystemFonts: false
    },
    background: bgColor,
    dpi: 1000
  })
  return resvg.render().asPng()
}

export const pngToJpg = async (source: Buffer): Promise<Buffer> => {
  const img = await jimp.read(source)
  return img.getBufferAsync(jimp.MIME_PNG)
}

export const svgToJpg = async (svgString: string, bgColor: string) => pngToJpg(await svgToPng(svgString, bgColor))
