import { AxiosProxyConfig } from 'axios'
import bluebird from 'bluebird'
import { parseEpub } from 'epub-modify'
import retry from 'p-retry'

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

  await retry(
    async () => {
      const transOpf = await translateOpf(await epub.getOpf(), options)
      await epub.setOpf(transOpf)
    },
    { retries: 2 },
  )

  await bluebird.each(epub.manifest, file => handleFile(file, options))

  return epub.toBuffer()
}

const Types = {
  xhtml: 'application/xhtml+xml',
  ncx: 'application/x-dtbncx+xml',
}

async function handleFile(file, options): Promise<void> {
  if (!file.isExists) {
    return
  }

  let transText

  try {
    await retry(
      async () => {
        switch (file['media-type']) {
          case Types.xhtml:
            transText = await translateXhtml(await file.getText(), options)
            break
          case Types.ncx:
            transText = await translateNcx(await file.getText(), options)
            break
        }
      },
      { retries: 2 },
    )
  } catch (err) {
    err.message = err.message + ' ' + file.href
    throw err
  }

  if (transText) {
    await file.setText(transText)
  }
}
