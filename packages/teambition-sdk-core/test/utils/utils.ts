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
  normPagingQuery,
  isEmptyObject
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

  it('normPagingQuery should return default result on empty or `undefined` input', () => {
    const defaultResult = {
      forUrl: { count: 500, page: 1 },
      forSql: { limit: 500, skip: 0 }
    }

    expect(normPagingQuery()).to.deep.equal(defaultResult)
    expect(normPagingQuery(undefined)).to.deep.equal(defaultResult)
  })

  it('normPagingQuery should fill in default values on incomplete input', () => {
    expect(normPagingQuery({ count: 10 })).to.deep.equal({
      forUrl: { count: 10, page: 1 },
      forSql: { limit: 10, skip: 0 }
    })
    expect(normPagingQuery({ page: 2 })).to.deep.equal({
      forUrl: { count: 500, page: 2 },
      forSql: { limit: 500, skip: 500 }
    })
  })

  it('normPagingQuery should keep properties other than orderBy|count|page|skip|limit for result', () => {
    const getQuery = () => ({
      count: 10,
      page: 2,
      prop1: 'hello',
      prop2: 2,
      props3: { 'c': 'world' },
      orderBy: []
    })

    const query = getQuery()
    const { forUrl, forSql } = normPagingQuery(query)

    expect(forUrl).to.deep.equal({
      count: 10,
      page: 2,
      prop1: 'hello',
      prop2: 2,
      props3: { 'c': 'world' }
    })

    expect(forSql).to.deep.equal({
      limit: 10,
      skip: 10,
      prop1: 'hello',
      prop2: 2,
      props3: { 'c': 'world' },
      orderBy: []
    })

    // shouldn't modify the input query
    expect(query).to.deep.equal(getQuery())
  })

  it('isEmptyObject should work correctly', () => {
    expect(isEmptyObject({})).to.be.true
    expect(isEmptyObject(1)).to.be.false
    expect(isEmptyObject({ a: 'a' })).to.be.false
    expect(isEmptyObject('a')).to.be.false
  })

})
