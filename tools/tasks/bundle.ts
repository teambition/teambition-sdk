'use strict'
import * as path from 'path'
import * as fs from 'fs'
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const alias = require('rollup-plugin-alias')

export function bundle (entry: string, output: string) {
  rollup.rollup({
    entry: entry,
    plugins: [
      alias({
        rxjs: path.join(process.cwd(), 'node_modules/rxjs-es/Rx.js'),
        'isomorphic-fetch': path.join(process.cwd(), 'node_modules/whatwg-fetch/fetch.js')
      }),
      babel({
        presets: [ 'es2015-rollup' ],
        runtimeHelpers: true
      }),
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true
      })
      // commonjs()
    ]
  })
    .then(bundle => {
      const code = bundle.generate({
        format: 'umd',
        moduleName: 'tbsdk'
      }).code

      return code
    })
    .then(code => {
      return write(path.resolve(process.cwd(), output), code)
    })
    .catch(e => console.error(e.stack))
}

function write (dest: string, code: string) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err)
      console.log(blue(dest) + ' ' + getSize(code))
      resolve()
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
