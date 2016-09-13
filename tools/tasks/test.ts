'use strict'
import * as path from 'path'
import * as fs from 'fs'

const Tman = require('Tman')

const cache: {[index: string]: any} = {}
const testDir = path.join(process.cwd(), 'spec-js/test/unit')

function runTman() {
  Tman.loadFiles(`${testDir}/app.js`)
  Tman.setExit(false)
  Tman.mocha()
  Tman.run()(() => {
    Tman.reset()
  })
}

let timer: NodeJS.Timer

function excuteTest() {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    runTman()
    timer = null
  }, 200)
}

fs.watch(path.join(process.cwd(), 'spec-js'), <any>{
  recursive: true
}, event => {
  excuteTest()
})

process.on('uncaughtException', err => {
  console.log(`Caught exception: ${err.stack}`);
})

console.log('\x1b[1m\x1b[34mwatch start\x1b[39m\x1b[22m')
