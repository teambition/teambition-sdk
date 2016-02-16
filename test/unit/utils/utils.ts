'use strict'
import * as chai from 'chai'
import {userMe} from '../mock'
import {forEach, clone, assign, uuid} from '../'

const expect = chai.expect

export default describe('utils test', () => {
  it('forEach should ok', () => {
    const testObject = {
      a: 1,
      b: 2,
      c: 3,
      d: {
        e: 4
      }
    }
    let times = 0
    forEach(testObject, (val: any) => {
      times ++
    })
    expect(times).to.equal(4)

    const testArray = [
      0,
      1,
      2,
      3,
      4,
      5
    ]

    times = 0

    forEach(testArray, (val: number) => {
      times ++
    })

    expect(times).to.equal(6)
  })

  it('inverse forEach should ok', () => {
    const arr = [
      0,
      1,
      2,
      3,
      4,
      5
    ]
    const result = []
    forEach(arr, (val) => {
      result.push(val)
    }, true)
    for (let i = 0; i < arr.length ; i ++) {
      expect(result[5 - i]).to.equal(arr[i])
    }
  })

  it('clone should ok', () => {
    const testObject = clone(userMe)
    expect(testObject).deep.equal(userMe)
    const testArray = [0, 1, 2, 3]
    expect(clone(testArray)).deep.equal(testArray)
  })

  it('assign should ok', () => {
    const testObject = {
      a: 0,
      b: 1,
      c: [2, 3]
    }
    const testTarget = assign({a: 5}, testObject)
    expect(testTarget.c).equal(testObject.c)
    expect(testTarget.a).equal(0)
  })

  it('uuid should ok', () => {
    const uuidStack = []
    for (let index = 0; index < 10000; index++) {
      const uu = uuid()
      expect(uuidStack.indexOf(uu)).to.equal(-1)
      uuidStack.push(uu)
    }
  })

})
