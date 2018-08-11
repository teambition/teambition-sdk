import { expect } from 'chai'
import { it, describe } from 'tman'
import { Observable } from 'rxjs'
import * as ix from '../../src/utils/interceptor'

describe.only('interceptor spec', () => {
  it('wrap: empty condition for no-param gate function', function* () {
    const result = 1
    const gate = () => Observable.of(result)
    const emptyIntercepted = ix.wrap(gate)
    yield emptyIntercepted()().do((x) => {
      expect(x).to.equal(result)
    })
  })

  it('wrap: empty condition for has-param gate function', function* () {
    const gate = (x: number, y: number) => Observable.of(x + y)
    const emptyIntercepted = ix.wrap(gate)
    yield emptyIntercepted()(1, 2).do((x) => {
      expect(x).to.equal(3)
    })
  })

  it('wrap: single interceptor for request', function* () {
    const interceptor = (options: { checkDividedByZero: boolean }, gateFn: any, gateArgs: any[]) => {
      if (options.checkDividedByZero) {
        const divisor = gateArgs[1]
        if (divisor === 0) {
          return Observable.of(0)
        }
      }
      return gateFn(...gateArgs)
    }
    const gate = (x: number, y: number) => Observable.of(x / y)
    const wrapped = ix.wrap(gate, interceptor)
    const intercepted = wrapped({ checkDividedByZero: true })
    yield intercepted(1, 0)
      .do((x) => {
        expect(x).to.equal(0)
      })
  })

  it('wrap: single interceptor for response', function* () {
    const interceptor = (options: { catchError: boolean }, gateFn: any, gateArgs: any[]) => {
      if (options.catchError) {
        return gateFn(...gateArgs).catch((err: any) => Observable.of(err.message))
      }
      return gateFn(...gateArgs)
    }
    const gate = () => Observable.throw(new Error('hello'))
    const wrapped = ix.wrap(gate, interceptor)
    const intercepted = wrapped({ catchError: true })
    yield intercepted()
      .do((x) => {
        expect(x).to.equal('hello')
      })
  })

  it('wrap: single interceptor for both request and response', function* () {
    const interceptor = (options: { checkDividedByZero: boolean, catchError: boolean }, gateFn: any, gateArgs: any[]) => {
      let result: Observable<any>
      if (options.checkDividedByZero) {
        const divisor = gateArgs[1]
        if (divisor === 0) {
          result = Observable.throw(new Error('divided-by-zero'))
        } else {
          result = gateFn(...gateArgs)
        }
      } else {
        result = gateFn(...gateArgs)
      }
      if (options.catchError) {
        result = result.catch((err: any) => Observable.of(err.message))
      }
      return result
    }
    const gate = (x: number, y: number) => Observable.of(x / y)
    const wrapped = ix.wrap(gate, interceptor)
    const intercepted = wrapped({ checkDividedByZero: true, catchError: true })
    yield intercepted(1, 0)
      .do((x) => {
        expect(x).to.equal('divided-by-zero')
      })
  })
})
