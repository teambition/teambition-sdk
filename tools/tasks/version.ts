'use strict'
import * as fs from 'fs'

const version = require('../../package.json').version

const replace = fs
  .readFileSync('src/app.ts', 'utf-8')
  .replace(/sdk\.version = '[\d\.]+'/, `sdk.version = '${version}'`)

fs.writeFileSync('src/app.ts', replace)
