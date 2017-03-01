import * as path from 'path'
import { Observable, Observer } from 'rxjs'

const fileWatcher = require('node-watch')
const testDir = path.join(process.cwd(), 'spec-js/test')
const testFile = `${testDir}/app`

export function runTman() {
  Object.keys(require.cache).forEach(id => {
    delete require.cache[id]
  })

  const { run, setExit, reset, mocha } = require(testFile)

  setExit(false)
  mocha()
  return run()(() => {
    reset()
  })
}

function watch (paths: string[]) {
  return Observable.from(paths)
    .map(p => path.join(process.cwd(), p))
    .mergeMap(path => {
      return Observable.create((observer: Observer<string>) => {
        fileWatcher(path, (evt: any) => {
          observer.next(evt)
        })
        return () => fileWatcher.close()
      })
    })
    .debounceTime(300)
}

watch(['spec-js'])
  .subscribe(() => {
    runTman()
  }, err => {
    console.error(err)
  })

process.on('uncaughtException', (err: any) => {
  console.log(`Caught exception: ${err.stack}`);
})

console.log('\x1b[1m\x1b[34mwatch start\x1b[39m\x1b[22m')

