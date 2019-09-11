// tslint:disable:no-expression-statement
import test from 'ava'
import { parseEpub } from 'epub-modify'
import fs from 'mz/fs'
import { translateEpub } from './translate-epub'

const root = process.cwd()

test('translateEpub', async t => {
  const buffer = await fs.readFile(root + '/fixtures/moby-dick.epub')
  const transBuffer = await translateEpub(buffer, {
    from: 'en',
    to: 'zh-CN',
    tld: 'cn',
  })

  const epub = await parseEpub(transBuffer)
  t.is(epub.metadata.title, '白鲸')
})
