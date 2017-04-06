import * as chai from 'chai'
import { it, describe } from 'tman'
import {
  forEach,
  clone,
  uuid,
  concat,
  dropEle,
  capitalizeFirstLetter,
  parseHeaders,
  omit
} from '../index'

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
    forEach(testObject, () => {
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

    forEach(testArray, () => {
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
    const fixture = {
      _id: '111',
      obj: {
        _id: 1,
        name: '2'
      },
      array: [1, 2, 3, 4],
      objArr: [ {
        _id: '222',
        haha: 2323
      }, {
        foo: 'foo',
        bar: 'baz'
      }],
      nest: {
        nest: true,
        arr: [1, 2, 3],
        fixture1: {
          depth1: 1,
          fixture2: {
            _depth: 2,
            fixture3: {
              _depth: 3,
              fixture4: {
                _id: 1,
                depth4: 4
              }
            }
          }
        }
      }
    }
    const testObject = clone(fixture)
    expect(testObject).deep.equal(fixture)
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
            h: 7,
            i: null
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

  it('capitalizeFirstLetter should ok', () => {
    const str = 'hello'
    const str1 = 'World'
    expect(capitalizeFirstLetter(str)).to.equal('Hello')
    expect(capitalizeFirstLetter(str1)).to.equal(str1)
  })

  it('parseResponseHeaders should ok', () => {
    const rawHeader = `Server: nginx
      Date: Sun, 09 Oct 2016 08:31:00 GMT
      Content-Type: application/json;charset=UTF-8
      Content-Length: 151
      Connection: keep-alive
      Api-Server-IP: 10.75.0.71`
    expect(parseHeaders(rawHeader)).to.deep.equal({
      'Server': 'nginx',
      'Date': 'Sun, 09 Oct 2016 08:31:00 GMT',
      'Content-Type': 'application/json;charset=UTF-8',
      'Content-Length': '151',
      'Connection': 'keep-alive',
      'Api-Server-IP': '10.75.0.71'
    })
  })

  it('omit should ok', () => {
    const omitProps = (x) => omit(x, 'x', 'y')
    expect(omitProps(0)).to.equal(0)
    expect(omitProps(undefined)).to.be.undefined
    expect(omitProps(null)).to.be.null
    expect(omitProps({ x: 1 })).to.deep.equal({})
    expect(omitProps({ z: 3 })).to.deep.equal({ z: 3 })
    expect(omitProps({ x: 1, y: 2, z: 3 })).to.deep.equal({ z: 3 })
  })

})
