'use strict'
import * as fs from 'fs'
import * as path from 'path'

const paths = ['mock', 'socket']
const version = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')).version

paths.forEach(_path => {
  const json = JSON.parse(fs.readFileSync(path.join(process.cwd(), `tools/publish/${_path}.json`), 'utf8'))
  json.version = version
  if (!fs.existsSync(`.tmp/${_path}`)) {
    fs.mkdirSync(`.tmp/${_path}`)
  }
  fs.writeFileSync(path.join(process.cwd(), `.tmp/${_path}/package.json`), JSON.stringify(json, null, 2), {
    encoding: 'utf8'
  })
  const distFile = fs.readFileSync(path.join(process.cwd(), `dist/bundle/tbsdk.${_path}.js`), 'utf8')
  fs.writeFileSync(`.tmp/${_path}/${_path}.bundle.js`, distFile, {
    encoding: 'utf8'
  })
})
