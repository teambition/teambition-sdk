'use strict'
import * as Rx from 'rxjs'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {timeout} from '../utils'
import Database from '../../../src/storage/database'

const expect = chai.expect
chai.use(sinonChai)

export default describe('database test: ', () => {

  let Storage: Database

  beforeEach(() => {
    Storage = new Database()
  })

  it('database storeOne/getOne should ok', done => {
    const data = {
      _id: '1111',
      data: 'tbsdk_test 1'
    }
    Storage.storeOne('1111', data)
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
    const set = Storage.storeOne('2222', data, 200)
    const get = Storage.get('2222')
    const get1 = timeout(get, 100)
    const get2 = timeout(get, 220)
    set.concatMap(x => get1.concat())
      .concatMap(x => {
        expect(x).to.deep.equal(data)
        return get2
      })
      .subscribe(r => {
        expect(r).to.be.undefined
        done()
      })
  })

  it('database delete should ok', done => {
    const data = {
      _id: '3333',
      data: 'tbsdk_test 3'
    }
    const set = Storage.storeOne('3333', data)

    const del = Storage.delete('3333')

    const get = Storage.get('3333')

    set.concatMap(x => get)
      .concatMap(x => del)
      .subscribe(x => {
        expect(x).to.be.null
        done()
      })
  })


  describe('update should ok: ', () => {
    it('update object should ok', done => {
      const data = {
        _id: '5555',
        data: 'tbsdk_test 5'
      }
      const patchData = {
        data: 'tbsdk_test 6'
      }
      const set = Storage.storeOne<typeof data>('5555', data)
      const update = Storage.updateOne('5555', patchData)
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
	    const set = Storage.storeOne('collection_test_1', data)
      const update = Storage.updateCollection('collection_test_1', patchData)
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

	    const set = Storage.storeCollection('collection_test_2', data)

      set.concatMap(r => Storage.updateOne('collection_test_2', patchData))
        .concatMap(r => Storage.get<typeof data>('collection_test_2'))
        .subscribe(r => {
          expect(r).to.deep.equal(patchData)
          done()
        })
    })

    it('patch data is not object should throw', done => {
      const set = Storage.storeOne('14.14', {
        _id: '14.14',
        data: 'tbsdk_test 14'
      })

      set.concatMap(r => Storage.updateOne('14.14', '5555'))
        .catch(e => {
          expect(e.message).to.equal('A patch should be Object')
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
      const set = Storage.storeOne('15.15', data, 50)
      const get = Storage.get<typeof data>('15.15')

      set.concatMap(x => {
        return timeout(get, 20).merge(Storage.updateOne('15.15', {
          expire: 100
        }))
      })
      .concatMap(x => {
        expect(x).to.deep.equal(data)
        return timeout(get, 50)
      })
      .concatMap(x => {
        expect(x).to.deep.equal(data)
        return timeout(get, 200)
      })
      .subscribe(r => {
        expect(r).to.be.undefined
        done()
      })
    })

    it('patch target not exist should throw', done => {
      Storage.updateOne('teambtion', {
        _id: 'teambtion',
        data: 'tbsdk_test teambtion'
      })
      .subscribe(null, err => {
        expect(err.message).to.equal('Patch target not exist: teambtion')
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

      const set = Storage.storeOne<typeof data>('20.20', data)
      const get = Storage.get<typeof data>('20.20')
      const update = Storage.updateOne('21.21', patch)

      set.concatMap(x => get)
        .concatMap(x => update)
        .concatMap(x => get)
        .subscribe(r => {
          expect(r.data.data).to.equal(patch.data)
          done()
        })
    })

    it('child of obj updated, parent should be notified', done => {
      const obj = {
        _id: '28.28',
        data: 'tbsdk_test 28',
        child: {
          _id: '29.29',
          data: 'tbsdk_test 29'
        }
      }

      Storage.storeOne('28.28', obj)
        .subscribe()

      Storage.get<typeof obj>('28.28')
        .skip(1)
        .subscribeOn(Rx.Scheduler.async, 100)
        .subscribe(r => {
          expect(r.child.data).to.equal('tbsdk_test 29.29')
          done()
        })

      Storage.updateOne('29.29', {
        data: 'tbsdk_test 29.29'
      })
        .subscribeOn(Rx.Scheduler.async, 200)
        .subscribe()
    })

    it('ele obj updted, collection include it should be notified', done => {
      const col = [
        {
          _id: '30.30',
          data: 'tbsdk_test 30'
        },
        {
          _id: '31.31',
          data: 'tbsdk_test 31'
        }
      ]

      Storage.storeCollection('collection_test_10', col)
        .subscribe(x => {
          Storage.get<typeof col>('collection_test_10')
            .skip(1)
            .subscribe(r => {
              expect(r[1].data).to.equal('tbsdk_test 31.31')
              done()
            })
        })


      Storage.updateOne('31.31', {
        data: 'tbsdk_test 31.31'
      })
        .subscribeOn(Rx.Scheduler.async, 200)
        .subscribe()
    })

    it('update ele in condition collection should ok', done => {
      const col = [
        {
          _id: '32.32',
          data: 'tbsdk_test 32'
        },
        {
          _id: '33.33',
          data: 'tbsdk_test 33'
        }
      ]

      Storage.storeCollection('collection_test_11', col, (x: any) => {
        return parseInt(x.data.split(' ').pop(), 10) < 50
      })
        .concatMap(x => Storage.updateOne('33.33', {
          data: 'tbsdk_test 80'
        }))
        .concatMap(x => Storage.get<any[]>('collection_test_11'))
        .subscribe(r => {
          expect(r.length).to.equal(1)
          expect(r[0]._id).to.equal('32.32')
          done()
        })

    })
  })

  it('store exist collection should throw', done => {
    const set1 = Storage.storeCollection('collection_test_4', [
      {
        _id: '16.16',
        data: 'tbsdk_test 16'
      }
    ])

    const set2 = Storage.storeCollection('collection_test_4', [
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
    const set1 = Storage.storeCollection('collection_test_5', objEle)
    const set2 = Storage.storeCollection('collection_test_6', colEle)

    set1.concatMap(x => set2)
      .concatMap(x => Storage.get<typeof objEle>('collection_test_5'))
      .subscribe(r => {
        expect(r[0].data).to.equal(colEle[0].data)
        done()
      })

  })

  it('update collection and new item updated, old singals should be notified', done => {
    const objEle = [
      {
        _id: '21.21',
        data: 'tbsdk_test 21'
      },
      {
        _id: '22.22',
        data: 'tbsdk_test 22'
      }
    ]

    const colEle = [
      {
        _id: '21.21',
        data: 'tbsdk_test 21.21'
      },
      {
        _id: '23.23',
        data: 'tbsdk_test 23'
      }
    ]

    const patchData = {
      _id: '23.23',
      data: 'tbsdk_test 23.23'
    }

    const result = [
      {
        _id: '21.21',
        data: 'tbsdk_test 21.21'
      },
      {
        _id: '23.23',
        data: 'tbsdk_test 23.23'
      },
      {
        _id: '22.22',
        data: 'tbsdk_test 22'
      }
    ]

    Storage.storeCollection('collection_test_7', objEle)
      .concatMap(x => Storage.updateCollection('collection_test_7', colEle))
      .subscribe(r => {
        Storage.get<typeof objEle>('collection_test_7')
          .skip(1)
          .subscribe(x => {
            expect(x).deep.equal(result)
            done()
          })
      })

    Storage.updateOne('23.23', patchData)
      .subscribeOn(Rx.Scheduler.async, 200)
      .subscribe()

  })


  it('add obj to exist collection should ok', done => {
    const objEle = [
      {
        _id: '24.24',
        data: 'tbsdk_test 24'
      }
    ]

    const patchObj = {
      _id: '25.25',
      data: 'tbsdk_test 25'
    }

    Storage.storeCollection('collection_test_8', objEle)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(2)
        expect(r.pop()).to.deep.equal(patchObj)
        done()
      })

    Storage.addToCollection('25.25', 'collection_test_8', patchObj)
      .subscribeOn(Rx.Scheduler.async, 200)
      .subscribe()
  })

  it('remove ele from collection should ok', done => {
    const objEle = [
      {
        _id: '26.26',
        data: 'tbsdk_test 26'
      },
      {
        _id: '27.27',
        data: 'tbsdk_test 27'
      }
    ]

    Storage.storeCollection('collection_test_9', objEle)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(1)
        expect(r[0].data).to.equal('tbsdk_test 27')
        done()
      })

      Storage.removeFromCollection('26.26', 'collection_test_9')
        .subscribeOn(Rx.Scheduler.async, 200)
        .subscribe()

  })

})
