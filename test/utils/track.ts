import * as chai from 'chai'
import {trackObject, trackOne, clone} from '../'

const expect = chai.expect

export default describe('Object Track test', () => {
  it('trackObject should ok', () => {
    const a = {
      _id: 1,
      foo: 'bar'
    }
    const b = clone({}, a)
    trackObject(a)
    trackOne(b)
    a.foo = 'kkk'
    expect(b.foo).to.equal('kkk')
  })
})
