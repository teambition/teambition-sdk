'use strict'
import * as chai from 'chai'
import { userMe } from '../../mock/userme'
import { forEach, clone, assign, uuid, concat, dropEle } from '../index'

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

  it('forEach break should ok', () => {
    const arr = [0, 1, 2, 3, 4]
    const dest = []
    forEach(arr, ele => {
      if (ele === 2) {
        return false
      }
      dest.push(ele)
    })
    expect(dest.length).to.equal(2)
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

  it('inverse forEach break should ok', () => {
    const arr = [0, 1, 2, 3, 4]
    const dest = []
    forEach(arr, ele => {
      if (ele === 1) {
        return false
      }
      dest.push(ele)
    }, true)
    expect(dest.length).to.equal(3)
  })

  it('forEach object should ok', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5
    }
    const arr = []
    const dest = [1, 2, 3, 4, 5]
    forEach(obj, val => {
      arr.push(val)
    })
    expect(arr).to.deep.equal(dest)
  })

  it('forEach object break should ok', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5
    }
    const arr = []
    const dest = [1, 2, 3]
    forEach(obj, val => {
      if (val === 4) {
        return false
      }
      return arr.push(val)
    })
    expect(arr).to.deep.equal(dest)
  })

  it('clone should ok', () => {
    const testObject = clone(userMe)
    expect(testObject).deep.equal(userMe)
    const testArray = [0, 1, 2, 3]
    expect(clone(testArray)).deep.equal(testArray)
  })

  it('clone deep object should ok', () => {
    const obj = {
      a: 1,
      b: {
        c: 3,
        d: 4,
        e: {
          f: 5,
          h: 6,
          j: {
            h: 7
          }
        }
      }
    }
    const obj2 = clone(obj)
    expect(obj2).to.deep.equal(obj)
    expect(obj2.b.e.j).not.equal(obj.b.e.j)
  })

  it('clone null should ok', () => {
    const result = clone(null)
    expect(result).to.be.null
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
    for (let index = 0; index < 100; index++) {
      const uu = uuid()
      expect(uuidStack.indexOf(uu)).to.equal(-1)
      uuidStack.push(uu)
    }
  })

  it('concat should ok', () => {
    const arr1 = [1]
    const arr2 = [2, 3, 4]
    const dest = [1, 2, 3, 4]

    concat(arr1, arr2)

    expect(arr1).to.deep.equal(dest)
  })

  it('concat patch is not array should ok', () => {
    const arr1 = [1, 2, 3]
    const arr2 = {
      a: 1,
      b: 2,
      c: 3,
      length: 3
    }
    expect(concat(arr1, <any>arr2)).to.deep.equal([1, 2, 3])
  })

  it('dropEle should ok', () => {
    const arr1 = [1, 2, 3, 4, 5]
    expect(dropEle(3, arr1)).to.deep.equal([1, 2, 4, 5])
  })

})
