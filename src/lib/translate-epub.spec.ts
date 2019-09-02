// tslint:disable:no-expression-statement
import test from 'ava'
import fs from 'mz/fs'
import { translateEpub } from './translate-epub'

const root = process.cwd()

test('translateEpub', async t => {
  const buffer = await fs.readFile(root + '/fixtures/basic-v3plus2.epub')
  const transBuffer = await translateEpub(buffer, {
    from: 'en',
    to: 'zh-CN',
    tld: 'cn',
  })
  t.true(transBuffer instanceof Buffer)
})
