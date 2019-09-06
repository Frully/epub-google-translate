import translate, { parseMultiple } from '@frully/google-translate-open-api'
import cheerio from 'cheerio'
import translateHtml from 'html-google-translate'
import htmlToText from 'html-to-text'

async function transTexts(text, options) {
  const texts = Array.isArray(text) ? text : [text]

  const result = await translate(texts, options)

  const transTextArr =
    typeof result.data === 'string'
      ? [result.data]
      : parseMultiple(result.data[0])

  return transTextArr
}

async function transText(text, options) {
  return transTexts(text, options)[0]
}

export async function translateOpf(xml, options) {
  const $ = cheerio.load(xml, { xmlMode: true })

  const $title = $('dc\\:title').first()

  if ($title.length) {
    $title.text(await transText($title.text(), options))
  }

  const $description = $('dc\\:description').first()

  if ($description.length) {
    const desc = htmlToText.fromString($description.html(), { wordwrap: false })
    $description.text(await transText(desc, options))
  }

  $('dc\\:language').text(options.to)

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
