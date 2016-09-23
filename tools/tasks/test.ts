'use strict'
import * as path from 'path'
import * as fs from 'fs'
import { runTman } from './tman'

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
