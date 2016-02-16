'use strict'
import * as path from 'path'
import * as browserSync from 'browser-sync'
import {bundle} from './bundle'

const reload = browserSync.reload
const buildConfigFile = path.join(process.cwd(), 'tools/build/bundle.json')

const entry = [
  'zone.js',
  path.join(process.cwd(), './.tmp/et/bundle.js'),
  path.join(process.cwd(), './dist/tbsdk.js'),
  path.join(process.cwd(), './test/browser/app/index.ts')
]
const output = 'app.js'

let initBrowserSync = false

bundle(entry, output, buildConfigFile, 'www/js', true, false, () => {
  if (initBrowserSync) return reload()
  initBrowserSync = true
  browserSync({
    notify: false,
    port: 9002,
    server: {
      baseDir: ['www'],
      routes: {}
    }
  })
})
