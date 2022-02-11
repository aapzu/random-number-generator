import { render } from '@resvg/resvg-js'
import jimp from 'jimp'

export const svgToPng = async (svgString: string) => {
  return render(svgString, {
    fitTo: {
      mode: 'original'
    },
    font: {
      loadSystemFonts: true // It will be faster to disable loading system fonts.
    },
    dpi: 1000
  })
}

export const pngToJpg = async (source: Buffer): Promise<Buffer> => {
  const img = await jimp.read(source)
  return img.getBufferAsync(jimp.MIME_PNG)
}

export const svgToJpg = async (svgString: string) => pngToJpg(await svgToPng(svgString))
