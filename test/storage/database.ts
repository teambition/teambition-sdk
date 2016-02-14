'use strict'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {forEach} from '../'
import Database from '../../src/storage/database'

const expect = chai.expect
chai.use(sinonChai)

export default describe('database test', () => {

  let Storage: Database

  beforeEach(() => {
    Storage = new Database()
  })

  it('database storeOne/getOne should ok', () => {
    const data = {
      _id: '1111',
      data: 'tbsdk_test 1'
    }
    Storage.store('1111', data)
    const result = Storage.getOne('1111')
    forEach(data, (val, key) => {
      expect(val).to.equal(result[key])
    })
  })

  it('database expire should ok', (done) => {
    const data = {
      _id: '2222',
      data: 'tbsdk_test 2'
    }
    Storage.store('2222', data, 20)
    const result = Storage.getOne('2222')
    forEach(data, (val, key) => {
      expect(val).to.equal(result[key])
    })
    setTimeout(() => {
      const result = Storage.getOne('2222')
      forEach(data, (val, key) => {
        expect(val).to.equal(result[key])
      })
    }, 10)
    setTimeout(() => {
      const result = Storage.getOne('2222')
      expect(result).to.be.undefined
      done()
    }, 21)
  })

  it('database delete should ok', () => {
    const data = {
      _id: '3333',
      data: 'tbsdk_test 3'
    }
    Storage.store('3333', data)
    Storage.delete('3333')
    const result = Storage.getOne('3333')
    expect(result).to.be.undefined
  })
})
