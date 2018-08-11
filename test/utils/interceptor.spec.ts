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
})
