import * as path from 'path'
import { from, Observable, Observer } from 'rxjs'
import { debounceTime, flatMap, map } from 'rxjs/operators'

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
  return from(paths)
    .pipe(
      map(p => path.join(process.cwd(), p)),
      flatMap(path => Observable.create((observer: Observer<string>) => {
        fileWatcher(path, { recursive: true }, (_: any, fileName: string) => {
          observer.next(fileName)
        })
        return () => fileWatcher.close()
      })),
      debounceTime(500)
    )
}

watch(['spec-js'])
  .subscribe(() => {
    runTman()
  }, err => {
    console.error(err)
  })

process.on('uncaughtException', (err: any) => {
  console.info(`Caught exception: ${err.stack}`)
})

process.on('SIGINT', () => {
  const watchCompilePid = Number(process.argv[2])
  if (watchCompilePid) {
    process.kill(watchCompilePid)
  }
  process.exit()
})

console.info('\x1b[1m\x1b[34mwatch start\x1b[39m\x1b[22m')
