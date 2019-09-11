import translate, { parseMultiple } from '@frully/google-translate-open-api'
import cheerio from 'cheerio'
import * as entities from 'entities'
import translateHtml from 'html-google-translate'

async function transTexts(text, options) {
  const texts = Array.isArray(text) ? text : [text]

  const res = await translate(texts, options)

  const transTextArr =
    typeof res.data === 'string' ? [res.data] : parseMultiple(res.data[0])

  return transTextArr
}

export async function translateOpf(xml, options) {
  const $ = cheerio.load(xml, { xmlMode: true, decodeEntities: false })

  const $nodes = $('dc\\:title, dc\\:description, title, description')

  const texts = $nodes.map((_, elem) => $(elem).text()).get()

  const trTexts = await transTexts(texts, options)

  $nodes.each((i, elem) => {
    const $elem = $(elem)

    const trText =
      elem.name === 'dc:description' || elem.name === 'description'
        ? entities.encode(trTexts[i])
        : trTexts[i]

    $elem.text(trText)
  })

  $('dc\\:language, language').text(options.to)

  return $.xml()
}

export async function translateXhtml(text, options) {
  return translateHtml(await text, {
    ...options,
    xmlMode: true,
  })
}

export async function translateNcx(xml, options) {
  const $ = cheerio.load(xml, { xmlMode: true })
  const nodes = $('text')
  const texts = nodes.map((_, node) => $(node).text()).get()

  const transTextArr = await transTexts(texts, options)

  nodes.map((i, elem) => $(elem).text(transTextArr[i]))

  return $.xml()
}
