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
    .flatMap(path => Observable.create((observer: Observer<string>) => {
      fileWatcher(path, { recursive: true }, (_: any, fileName: string) => {
        observer.next(fileName)
      })
      return () => fileWatcher.close()
    }))
    .debounceTime(300)
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
  if (watchCompilePid){
    process.kill(watchCompilePid)
  }
  process.exit()
})

console.info('\x1b[1m\x1b[34mwatch start\x1b[39m\x1b[22m')
