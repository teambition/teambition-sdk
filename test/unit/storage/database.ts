'use strict'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {forEach} from '../'
import Database from '../../../src/storage/database'

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

  it('get expire should ok', (done) => {
    const data = {
      _id: '4444',
      data: 'tbsdk_test 4'
    }
    Storage.store('4444', data, 2000)
    setTimeout(() => {
      const expire = Storage.getExpire('4444')
      expect(expire).to.be.most(1990)
      done()
    }, 10)
  })

  describe('update should ok', () => {
    it('update object should ok', () => {
      const data = {
        _id: '5555',
        data: 'tbsdk_test 5'
      }
      Storage.store('5555', data)
      const patchData = {
        data: 'tbsdk_test 6'
      }
      Storage.update('5555', patchData)
      const result = Storage.getOne<typeof data>('5555')
      expect(result.data).to.equal(patchData.data)
    })

    it('update collection exist ele should ok', () => {
      const data = [
        {
          _id: '6666',
          data: 'tbsdk_test 6'
        },
        {
          _id: '7777',
          data: 'tbsdk_test 7'
        }
      ]
	    Storage.store('collection_test_1', data)
      const patchData = [
        {
          _id: '6666',
          data: 'tbsdk_test 66'
        },
        {
          _id: '7777',
          data: 'tbsdk_test 77'
        }
      ]
      Storage.update('collection_test_1', patchData)
      const result = Storage.getOne<typeof data>('collection_test_1')
      forEach(patchData, (value, index) => {
        forEach(value, (val, key) => {
          expect(val).to.equal(result[index][key])
        })
      })
    })

    it('update collection not exist ele should ok', () => {
      const data = [
        {
          _id: '8888',
          data: 'tbsdk_test 8'
        },
        {
          _id: '9999',
          data: 'tbsdk_test 9'
        }
      ]
	    Storage.store('collection_test_2', data)
      const patchData = [
        {
          _id: '9999',
          data: 'tbsdk_test 99'
        },
        {
          _id: '1010',
          data: 'tbsdk_test 1.0'
        },
        {
          _id: '8888',
          data: 'tbsdk_test 88'
        },
        {
          _id: '11.11',
          data: 'tbsdk_test 1.1'
        }
      ]

      Storage.update('collection_test_2', patchData)
      const result = Storage.getOne<typeof data>('collection_test_2')
      forEach(patchData, (value, index) => {
        forEach(value, (val, key) => {
          expect(val).to.equal(result[index][key])
        })
      })
    })

    it('patch data to collection is not Array should return undefined', () => {
      const data = [
        {
          _id: '12.12',
          data: 'tbsdk_test 12'
        },
        {
          _id: '13.13',
          data: 'tbsdk_test 13'
        }
      ]
	    Storage.store('collection_test_3', data)
      expect(Storage.update('collection_test_3', {
        _id: 'collection_test_3',
        data: 'tbsdk_test 13'
      })).to.be.undefined
    })

    it('patch data is not object should throw', () => {
      Storage.store('14.14', {
        _id: '14.14',
        data: 'tbsdk_test 14'
      })
      const patchFn = () => {
        Storage.update('14.14', '5555')
      }
      expect(patchFn).to.throw('A patch should be Object')
    })

    it('update object expire should ok', (done) => {
      const data = {
        _id: '15.15',
        data: 'tbsdk_test 15'
      }
      Storage.store('15.15', data, 50)
      setTimeout(() => {
        const result = Storage.getOne<typeof data>('15.15')
        forEach(data, (val, key) => {
          expect(result[key]).to.deep.equal(val)
        })
        Storage.update('15.15', {
          expire: 100
        })
      }, 25)
      setTimeout(() => {
        const result = Storage.getOne<typeof data>('15.15')
        forEach(data, (val, key) => {
          expect(result[key]).to.deep.equal(val)
        })
      }, 100)
      setTimeout(() => {
        const result = Storage.getOne<typeof data>('15.15')
        expect(result).to.be.undefined
        done()
      }, 300)
    })

    it('patch target not exist should return undefined', () => {
      expect(Storage.update('teambtion', {
        _id: 'teambtion',
        data: 'tbsdk_test teambtion'
      })).to.be.undefined
    })

    it('patch object exist in other object should ok', () => {
      const data = {
        _id: '20.20',
        data: {
          _id: '21.21',
          data: 'tbsdk_test 21'
        }
      }
      Storage.store('20.20', data)
      const result = Storage.getOne<typeof data>('20.20')
      const patch = {
        data: 'tbsdk_test 21.21'
      }
      Storage.update('21.21', patch)
      expect(result.data.data).to.equal(patch.data)
    })
  })

  it('store exist collection should return undefined', () => {
    Storage.store('collection_test_4', [
      {
        _id: '16.16',
        data: 'tbsdk_test 16'
      }
    ])
    expect(Storage.store('collection_test_4', [
      {
        _id: '17.17',
        data: 'tbsdk_test 17'
      }
    ])).to.be.undefined
  })

  it('store collection that include exist object, the old one should be updated', () => {
    const objEle = [
      {
        _id: '18.18',
        data: 'tbsdk_test 18'
      },
      {
        _id: '20.20',
        data: 'tbsdk_test 20'
      }
    ]
    Storage.store('collection_test_5', objEle)
    const colEle = [
      {
        _id: '18.18',
        data: 'tbsdk_test 18.18'
      },
      {
        _id: '19.19',
        data: 'tbsdk_test 19.19'
      }
    ]
    Storage.store('collection_test_6', colEle)
    const result = Storage.getOne<typeof objEle>('collection_test_5')
    expect(result[0].data).to.equal(colEle[0].data)
  })
})
