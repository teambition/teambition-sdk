'use strict'
import * as Rx from 'rxjs'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {forEach} from '../index'
import {timeout} from '../utils'
import Database from '../../../src/storage/database'

const expect = chai.expect
chai.use(sinonChai)

export default describe('database test', () => {

  let Storage: Database

  beforeEach(() => {
    Storage = new Database()
  })

  it('database storeOne/getOne should ok', done => {
    const data = {
      _id: '1111',
      data: 'tbsdk_test 1'
    }
    Storage.set('1111', data)
      .subscribe(res => {
        expect(res).to.deep.equal(data)
        done()
      })
  })

  it('database expire should ok', done => {
    const data = {
      _id: '2222',
      data: 'tbsdk_test 2'
    }
    const set = Storage.set('2222', data, 200)
    const get = Storage.get('2222')

    set.combineLatest(timeout(get, 100), timeout(get, 220))
      .subscribe(r => {
        expect(r[1]).to.deep.equal(data)
        expect(r[2]).to.be.undefined
        done()
      })
  })

  it('database delete should ok', done => {
    const data = {
      _id: '3333',
      data: 'tbsdk_test 3'
    }
    const set = Storage.set('3333', data)

    const del = Storage.delete('3333')

    const get = Storage.get('3333')

    set.concatMap(x => get)
      .concatMap(x => del)
      .subscribe(x => {
        expect(x).to.be.null
        done()
      })
  })


  describe('update should ok', () => {
    it('update object should ok', done => {
      const data = {
        _id: '5555',
        data: 'tbsdk_test 5'
      }
      const patchData = {
        data: 'tbsdk_test 6'
      }
      const set = Storage.set<typeof data>('5555', data)
      const update = Storage.update('5555', patchData)
      const get = Storage.get<typeof data>('5555')

      set.delayWhen(() => update.delayWhen(() => get, get), update)
        .subscribe(r => {
          expect(r.data).to.equal(patchData.data)
          done()
        })


    })

    it('update collection exist ele should ok', done => {
      const data = [
        {
          _id: '6666',
          data: 'tbsdk_test 6'
        },
        {
          _id: '7777',
          data: 'tbsdk_test 7'
        },
        {
          _id: '8888',
          data: 'tbsdk_test 8'
        }
      ]
      const patchData = [
        {
          _id: '6666',
          data: 'tbsdk_test 66'
        },
        {
          _id: '7777',
          data: 'tbsdk_test 77'
        },
        {
          _id: '8888',
          data: 'tbsdk_test 88'
        }
      ]
	    const set = Storage.set('collection_test_1', data)
      const update = Storage.update('collection_test_1', patchData)
      const get = Storage.get<typeof data>('collection_test_1')


      set.concatMap(val => update)
        .concatMap(val => get)
        .subscribe(r => {
          expect(r).to.deep.equal(patchData)
          done()
        })
    })

    it('update collection not exist ele should ok', done => {
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

	    const set = Storage.set('collection_test_2', data)
      const update = Storage.update('collection_test_2', patchData)
      const get = Storage.get<typeof data>('collection_test_2')

      set.concatMap(r => update)
        .concatMap(r => get)
        .subscribe(r => {
          expect(r).to.deep.equal(patchData)
          done()
        })

    })

    it('patch data is not object should throw', done => {
      const set = Storage.set('14.14', {
        _id: '14.14',
        data: 'tbsdk_test 14'
      })

      const update = Storage.update('14.14', '5555')

      set.concatMap(r => update)
        .catch(e => {
          expect(e).to.equal('A patch should be Object')
          return Rx.Observable.of(null)
        })
        .subscribe(val => {
          expect(val).to.be.null
          done()
        })

    })

    it('update object expire should ok', done => {
      const data = {
        _id: '15.15',
        data: 'tbsdk_test 15'
      }
      const set = Storage.set('15.15', data, 50)
      const get = Storage.get<typeof data>('15.15')
      const update = Storage.update('15.15', {
        expire: 100
      })

      set.combineLatest(timeout(get, 20), timeout(update, 40), timeout(get, 100), timeout(get, 200))
        .subscribe(r => {
          expect(r[1]).to.deep.equal(data)
          expect(r[3]).to.deep.equal(data)
          expect(r[4]).to.be.undefined
          done()
        })
    })

    it('patch target not exist should return undefined', done => {
      Storage.update('teambtion', {
        _id: 'teambtion',
        data: 'tbsdk_test teambtion'
      })
      .subscribe(null, err => {
        expect(err.message).to.equal('Patch target not exist')
        done()
      })
    })

    it('patch object exist in other object should ok', done => {
      const data = {
        _id: '20.20',
        data: {
          _id: '21.21',
          data: 'tbsdk_test 21'
        }
      }
      const patch = {
        data: 'tbsdk_test 21.21'
      }

      const set = Storage.set<typeof data>('20.20', data)
      const get = Storage.get<typeof data>('20.20')
      const update = Storage.update('21.21', patch)

      set.concatMap(x => get)
        .concatMap(x => update)
        .concatMap(x => get)
        .subscribe(r => {
          expect(r.data.data).to.equal(patch.data)
          done()
        })
    })
  })

  it('store exist collection should return undefined', done => {
    const set1 = Storage.set('collection_test_4', [
      {
        _id: '16.16',
        data: 'tbsdk_test 16'
      }
    ])

    const set2 = Storage.set('collection_test_4', [
      {
        _id: '17.17',
        data: 'tbsdk_test 17'
      }
    ])

    set1.concatMap(x => set2)
      .subscribe(null, err => {
        expect(err.message).to.equal('Can not store an existed collection')
        done()
      })
  })

  it('store collection that include exist object, the old one should be updated', done => {
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
    const set1 = Storage.set('collection_test_5', objEle)
    const set2 = Storage.set('collection_test_6', colEle)
    const get = Storage.get<typeof objEle>('collection_test_5')
    set1.concatMap(x => set2)
      .concatMap(x => get)
      .subscribe(r => {
        expect(r[0].data).to.equal(colEle[0].data)
        done()
      })

  })
})
