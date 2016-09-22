'use strict'
import BaseModel from './models/BaseModel'

declare module './testable' {
  interface Testable {
    flushSideEffect: () => void
  }
}

function flushSideEffect() {
  BaseModel.TeardownLogics.forEach(r => {
    if (typeof r === 'function') {
      r()
    } else {
      throw new TypeError(`TearDown logic must be function, but: ${JSON.stringify(r)}`)
    }
  })
  BaseModel.DataBase.flush()
}

export class Testable { }

Testable.prototype.flushSideEffect = flushSideEffect

export const testable = new Testable
