'use strict'
import * as path from 'path'
import * as fs from 'fs'
const rollup = require('rollup')
const nodeResolve = require('rollup-plugin-node-resolve')
const alias = require('rollup-plugin-alias')
const commonjs = require('rollup-plugin-commonjs')
const compiler = require('google-closure-compiler-js').compile

export function bundle (entry: string, output: string, name: string) {
  const plugins = [
    alias({
      'isomorphic-fetch': path.join(process.cwd(), 'node_modules/whatwg-fetch/fetch.js'),
      'engine.io-client': path.join(process.cwd(), 'node_modules/engine.io-client/engine.io.js')
    }),
    nodeResolve({
      jsnext: false,
      main: true
    }),
    commonjs({
      exclude: [ 'dist/es6/**', 'dist/mock-es6/**', 'node_modules/lovefield/**' ],
      namedExports: {
        'reactivedb': [ 'JoinMode' ]
      }
    })
  ]
  rollup.rollup({
    entry: entry,
    plugins: plugins
  })
    .then((bundle: any) => {
      const code = bundle.generate({
        format: 'umd',
        moduleName: name,
        globals: {
          lovefield: 'lf'
        },
        external: [ 'lovefield' ]
      }).code

      return code
    })
    .then((code: string) => {
      return write(path.resolve(process.cwd(), output), code)
    })
    .then(() => {
      const source = fs.readFileSync(path.resolve(process.cwd(), output), 'utf8')
      const compilerFlags = {
        jsCode: [{ src: source }],
        compilationLevel: 'ADVANCED',
        languageIn: 'ECMASCRIPT6',
        createSourceMap: true
      }
      const result: any = compiler(compilerFlags)
      const minPath = `dist/bundle/${output.split('/').pop()!.split('.')[1]}.min.js`
      const code = result.compiledCode
      fs.writeFileSync(minPath, code, 'utf8')
      fs.writeFileSync(`${minPath}.map`, result.sourceMap, 'utf8')
      console.info(blue(minPath) + ' ' + getSize(code))
    })
    .catch((e: Error) => console.error(e))
}

export function write (dest: string, code: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dest, code, (err) => {
      if (err) {
        return reject(err)
      }
      console.info(blue(dest) + ' ' + getSize(code))
      resolve()
    })
  })
}

function getSize (code: string): string {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function blue (str: string): string {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
