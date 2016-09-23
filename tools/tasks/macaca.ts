import { runTman } from './tman'
import { Observable, Observer } from 'rxjs'

Observable.of('electron', 'chrome')
  .concatMap(browser => {
    const wd = require('webdriver-client')({
      platformName: 'desktop',
      browserName: browser
    })

    const driver = wd.initPromiseChain()

    const tmanTask = Observable.create((observer: Observer<any>) => {
      runTman()(() => {
        driver.quit()
        observer.complete()
      })
    })

    return driver.initDriver()
      .maximize()
      .setWindowSize(1280, 800)
      .then(() => tmanTask.toPromise())
  })
  .subscribe()

