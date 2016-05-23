'use strict'
import * as Mocha from 'mocha'
import * as path from 'path'
import * as fs from 'fs'

const cache: {[index: string]: any} = {}
const testDir = '.tmp/test/unit'

for (let key in require.cache) {
  cache[key] = true
}

function clearCache() {
  for (var key in require.cache) {
    if (!cache[key] && !/\.node$/.test(key)) {
      delete require.cache[key]
    }
  }
}

function runMocha() {
  const mocha = new Mocha({
    reporter: 'dot'
  })

  mocha.addFile(`${testDir}/app.js`)
  mocha.run(err => {
    clearCache()
  })
}

let timer: NodeJS.Timer

function excuteTest() {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
      runMocha()
    timer = null
  }, 200)
}

fs.watch(testDir, event => {
  excuteTest()
})


console.log('\x1b[1m\x1b[34mwatch start\x1b[39m\x1b[22m')
