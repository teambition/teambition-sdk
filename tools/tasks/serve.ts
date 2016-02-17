'use strict'
import * as path from 'path'
import * as browserSync from 'browser-sync'
import * as opn from 'opn'
import {bundle} from './bundle'

const reload = browserSync.reload
const buildConfigFile = path.join(process.cwd(), 'tools/build/bundle.json')

const entry = [
  'zone.js',
  path.join(process.cwd(), './.tmp/et/bundle.js'),
  path.join(process.cwd(), './dist/tbsdk.js'),
  path.join(process.cwd(), './test/browser/app/app.ts')
]
const output = 'app.js'

let initBrowserSync = false

bundle(entry, output, buildConfigFile, 'www/js', true, false, () => {
  if (initBrowserSync) return reload()
  initBrowserSync = true
  browserSync({
    notify: false,
    port: 5001,
    socket: {
      domain: 'http://localhost:5001'
    },
    open: false,
    server: {
      baseDir: ['www'],
      routes: {}
    }
  })
  opn('http://project.ci', {app: 'google chrome'})
})
