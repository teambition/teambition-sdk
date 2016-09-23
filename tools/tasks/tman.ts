import * as Tman from 'tman'
import * as path from 'path'

const testDir = path.join(process.cwd(), 'spec-js/test/unit')
const testFile = `${testDir}/app.js`

export function runTman() {
  const tman = Tman.createTman()
  for (let key of ['describe', 'suite', 'test', 'it', 'before', 'after', 'beforeEach', 'afterEach']) {
    global[key] = tman[key]
  }
  Object.keys(require.cache).forEach(id => {
    delete require.cache[id]
  })
  require(testFile)

  tman.setExit(false)
  tman.mocha()
  return (<any>tman).run()(() => {
    tman.reset()
  })
}
