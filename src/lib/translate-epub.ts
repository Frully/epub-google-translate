import { AxiosProxyConfig } from 'axios'
import bluebird from 'bluebird'
import { parseEpub } from 'epub-modify'

import { translateNcx, translateOpf, translateXhtml } from './translate'

interface TranslateEpubOptions {
  readonly from: string
  readonly to: string
  readonly tld?: string
  readonly proxy?: AxiosProxyConfig
  readonly config?: object
}

export async function translateEpub(
  buffer: Buffer,
  options: TranslateEpubOptions,
): Promise<Buffer> {
  const epub = await parseEpub(buffer)

  const transOpf = await translateOpf(await epub.getOpf(), options)
  await epub.setOpf(transOpf)

  await bluebird.each(epub.manifest, file => handleFile(file, options))

  return epub.toBuffer()
}

const Types = {
  xhtml: 'application/xhtml+xml',
  ncx: 'application/x-dtbncx+xml',
}

async function handleFile(file, options): Promise<void> {
  const text = await file.getText()
  let transText

  switch (file['media-type']) {
    case Types.xhtml:
      transText = await translateXhtml(text, options)
      break
    case Types.ncx:
      transText = await translateNcx(text, options)
      break
  }

  if (transText) {
    await file.setText(transText)
  }
}
