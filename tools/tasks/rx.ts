'use strict'
import * as path from 'path'
import * as fs from 'fs'
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const config = require('./rx.config.json')

const bundleRx = (configs: {
  operator: string[],
  observable: string[]
}): Promise<void> => {
  const operators = configs.operator
  const observable = configs.observable
  const modulePath = './add'

  let codes = `'use strict';
export { Subject } from './Subject';
export { Observable } from './Observable';

`

  const tails = `
export { Operator } from './Operator';
export { Subscription } from './Subscription';
export { Subscriber } from './Subscriber';
export { AsyncSubject } from './AsyncSubject';
export { ReplaySubject } from './ReplaySubject';
export { BehaviorSubject } from './BehaviorSubject';
export { MulticastObservable } from './observable/MulticastObservable';
export { ConnectableObservable } from './observable/ConnectableObservable';
export { Notification } from './Notification';
export { EmptyError } from './util/EmptyError';
export { ArgumentOutOfRangeError } from './util/ArgumentOutOfRangeError';
export { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';
export { UnsubscriptionError } from './util/UnsubscriptionError';
export { TimeInterval } from './operator/timeInterval';
export { Timestamp } from './operator/timestamp';
export { TestScheduler } from './testing/TestScheduler';
export { VirtualTimeScheduler } from './scheduler/VirtualTimeScheduler';
export { AjaxResponse, AjaxError, AjaxTimeoutError } from './observable/dom/AjaxObservable';
import { asap } from './scheduler/asap';
import { async } from './scheduler/async';
import { queue } from './scheduler/queue';
import { animationFrame } from './scheduler/animationFrame';
import { $$rxSubscriber as rxSubscriber } from './symbol/rxSubscriber';
import { $$iterator as iterator } from './symbol/iterator';
import * as observable from 'symbol-observable';

let Scheduler = {
    asap,
    async,
    queue,
    animationFrame
};

let Symbol = {
    rxSubscriber,
    observable,
    iterator
};
export { Scheduler, Symbol };
`

  if (isValidConf(observable)) {
    observable.forEach(value => generateCodes('observable', value))
  }

  if (isValidConf(operators)) {
    operators.forEach(value => generateCodes('operator', value))
  }

  codes += tails

  const tmpEntryName = 'Rx.min.js'

  function bundle(entry: string): Promise<string> {
    const babelConf = babel({
      presets: [ 'es2015-rollup' ],
      runtimeHelpers: true
    })
    return rollup.rollup({
      entry: entry,
      plugins: [
        babelConf,
        nodeResolve({
          jsnext: false,
          main: true
        }),
        commonjs({
          include: 'node_modules/symbol-observable/**',
          exclude: 'dist/bundle/**'
        })
      ]
    })
    .then(b => {
      const code = b.generate({
        format: 'cjs'
      }).code

      return code
    })
    .catch(e => console.error(e.stack))
  }

  function write (dest: string, code: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(dest, code, err => {
        if (err) return reject(err)
        console.log(blue(dest) + ' ' + getSize(code))
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

  function isValidConf (conf: string[]): boolean {
    return !!(conf && (conf instanceof Array) && conf.length)
  }

  function generateCodes (key: string, value: string): void {
    const moduleName = `${modulePath}/${key}/${value}`
    codes += `import '${moduleName}';
`
  }

  return write(`node_modules/rxjs-es/${tmpEntryName}`, codes)
    .then(() => {
      return bundle(`node_modules/rxjs-es/${tmpEntryName}`)
    })
    .then(res => write('dist/bundle/Rx.js', res))
    .catch(e => console.error(e.stack))
}

bundleRx(config)
