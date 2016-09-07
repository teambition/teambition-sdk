/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
/// <reference path="../../typings/globals/chai/index.d.ts" />
/// <reference path="../../typings/globals/sinon-chai/index.d.ts" />
/// <reference path="../../typings/globals/sinon/index.d.ts" />

declare namespace NodeJS {
  export interface Global {
    timeout1: number
    timeout2: number
    timeout3: number
    timeout4: number
  }
}
