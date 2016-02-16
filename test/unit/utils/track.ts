import * as chai from 'chai'
import {trackObject, trackOne, clone, trackCollection} from '../index'
import {organizations} from '../mock'

const expect = chai.expect

export default describe('Object Track test', () => {
  it('track object should ok', () => {
    const a = {
      _id: '1',
      foo: 'bar'
    }
    const b = clone(a)
    trackObject(a)
    trackOne('1', b)
    a.foo = 'kkk'
    expect(b.foo).to.equal('kkk')
  })

  describe('track collection should ok', () => {
    let orgs: typeof organizations
    let orgs1: typeof organizations
    let originLength: number

    beforeEach(() => {
      orgs = clone<typeof organizations>(organizations)
      orgs1 = clone<typeof organizations>(organizations)
      trackCollection('orgs', orgs)
      trackOne('orgs', orgs1)
      originLength = orgs.length
    })

    it('collection push should ok', () => {
      const item = orgs[2]
      orgs.push(item)
      expect(orgs1.length).to.equal(originLength + 1)
      expect(orgs1[originLength]).deep.equal(item)
    })

    it('collection splice should ok', () => {
      const item = orgs[0]
      orgs.splice(1, 0, item)
      expect(orgs1.length).to.equal(originLength + 1)
      expect(orgs1[1]).deep.equal(item)
    })

    it('collection pop should ok', () => {
      orgs.pop()
      expect(orgs1.length).to.equal(originLength - 1)
      expect(orgs1[originLength - 1]).deep.equal(orgs[originLength - 1])
    })

    it('collection unshift should ok', () => {
      const item = orgs[2]
      orgs.unshift(item)
      expect(orgs1.length).to.equal(originLength + 1)
      expect(orgs1[0]).deep.equal(item)
    })

    it('collection modify should ok', () => {
      orgs[0].name = 'tb test'
      expect(orgs1[0].name).to.equal('tb test')
    })
  })

  it('track a non-array should throw', () => {
    const nonArray: any = {
      _id: '111',
      length: 1,
      data: 'test'
    }
    expect(() => {
      trackCollection('111', nonArray)
    }).to.throw('Could not track a none array object')
  })
})
