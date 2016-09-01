'use strict'
import BaseModel from './models/BaseModel'

declare module './testable' {
  interface Testable {
    flushSideEffect: () => void
  }
}

function flushSideEffect() {
  BaseModel.DataBase.flush()
}

export class Testable { }

Testable.prototype.flushSideEffect = flushSideEffect

export const testable = new Testable
