'use strict'
import * as fs from 'fs'
import * as path from 'path'

const paths = ['mock', 'socket']
const version = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')).version

const mkdirSyncByPath = (pathString: string) => {
  pathString
    .split(path.sep)
    .reduce((curPath: string, folder: string) => {
      curPath += folder + path.sep
      if (!fs.existsSync(curPath)) {
        fs.mkdirSync(curPath)
      }
      return curPath
    }, '')
}

paths.forEach(_path => {
  const json = JSON.parse(fs.readFileSync(path.join(process.cwd(), `tools/publish/${_path}.json`), 'utf8'))
  json.version = version
  mkdirSyncByPath(`.tmp/${_path}`)
  fs.writeFileSync(path.join(process.cwd(), `.tmp/${_path}/package.json`), JSON.stringify(json, null, 2), {
    encoding: 'utf8'
  })
  const distFile = fs.readFileSync(path.join(process.cwd(), `dist/bundle/tbsdk.${_path}.js`), 'utf8')
  fs.writeFileSync(`.tmp/${_path}/${_path}.bundle.js`, distFile, {
    encoding: 'utf8'
  })
})
