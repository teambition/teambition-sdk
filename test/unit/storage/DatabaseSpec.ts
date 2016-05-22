'use strict'
import * as Rx from 'rxjs'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
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
    Storage.storeOne(data)
      .subscribe(res => {
        expect(res).to.deep.equal(data)
        done()
      })
  })

  it('database delete should ok', done => {
    const data = {
      _id: '3333',
      data: 'tbsdk_test 3'
    }
    const set = Storage.storeOne(data)

    const del = Storage.delete('3333')

    const get = Storage.get('3333')

    set.concatMap(x => get)
      .concatMap(x => del)
      .subscribe(x => {
        expect(x).to.be.undefined
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
      const set = Storage.storeOne<typeof data>(data)
      const update = Storage.updateOne('5555', patchData)
      const get = Storage.get<typeof data>('5555')

      set.subscribe()

      get.subscribeOn(Rx.Scheduler.async, 10)
        .skip(1)
        .subscribe(r => {
          expect(r.data).to.equal(patchData.data)
          done()
        })

      update.subscribeOn(Rx.Scheduler.async, 20)
        .subscribe()

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
	    const set = Storage.storeCollection('collection_test_1', data)
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
      const update = Storage.updateCollection('collection_test_2', patchData)
      const get = Storage.get<typeof data>('collection_test_2')

      set.concatMap(r => update)
        .concatMap(r => get)
        .subscribe(r => {
          expect(r).to.deep.equal(patchData)
          done()
        }, err => {
          console.log(err)
        })
    })

    it('patch data is not object should throw', done => {
      const set = Storage.storeOne({
        _id: '14.14',
        data: 'tbsdk_test 14'
      })

      set.concatMap(r => Storage.updateOne('14.14', '5555'))
        .subscribe(null, (err: Error) => {
          expect(err.message).to.equal('A patch should be Object')
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

      const set = Storage.storeOne<typeof data>(data)
      const get = Storage.get<typeof data>('20.20')
      const update = Storage.updateOne('21.21', patch)

      set.subscribe()

      set.concatMap(x => update)
        .concatMap(x => get)
        .subscribe(r => {
          expect(r.data.data).to.equal(patch.data)
          done()
        }, err => console.log(err))
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

      Storage.storeOne(obj)
        .subscribe()

      Storage.get<typeof obj>('28.28')
        .skip(1)
        .subscribeOn(Rx.Scheduler.async, 20)
        .subscribe(r => {
          expect(r.child.data).to.equal('tbsdk_test 29.29')
          done()
        })

      Storage.updateOne('29.29', {
        data: 'tbsdk_test 29.29'
      })
        .subscribeOn(Rx.Scheduler.async, 50)
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
        .subscribeOn(Rx.Scheduler.async, 50)
        .subscribe()
    })

    it('update ele in condition collection should ok', done => {
      const getSchemaName = () => 'schema_test'
      const col = [
        {
          _id: '32.32',
          data: 'tbsdk_test 32',
          getSchemaName: getSchemaName
        },
        {
          _id: '33.33',
          data: 'tbsdk_test 33',
          getSchemaName: getSchemaName
        }
      ]

      const update = Storage.updateOne('33.33', {
        data: 'tbsdk_test 80'
      })

      const get = Storage.get<any[]>('collection_test_11')

      Storage.storeCollection('collection_test_11', col, 'schema_test', (x: any) => {
        return parseInt(x.data.split(' ').pop(), 10) < 50
      })
        .concatMap(x => update)
        .concatMap(x => get)
        .subscribe(r => {
          expect(r.length).to.equal(1)
          expect(r[0]._id).to.equal('32.32')
          done()
        })

    })

    describe('change ele to satisfy collection condition: ', () => {
      class TestEle {
        constructor(public _id: string, public name: string, public age: number) {}

        getSchemaName() {
          return 'TestEle'
        }
      }

      it('collection should be updated', done => {
        Storage.storeCollection('collection_test_14', [
          new TestEle('40.40', 'tbsdk_test 40', 40),
          new TestEle('41.41', 'tbsdk_test 41', 41)
        ], 'TestEle', (ele: TestEle) => {
          return ele.age > 30
        }).subscribe()

        Storage.get<TestEle[]>('collection_test_14')
          .subscribeOn(Rx.Scheduler.async, 20)
          .skip(1)
          .subscribe(r => {
            expect(r.length).to.equal(3)
            expect(r[0].name).to.equal('tbsdk_test 42')
            done()
          })

        Storage.storeOne(new TestEle('42.42', 'tbsdk_test 42', 42))
          .subscribeOn(Rx.Scheduler.async, 40)
          .subscribe()
      })

      it('collection should be updated', done => {

        Storage.storeCollection('collection_test_12', [
          new TestEle('34.34', 'tbsdk_test 34', 34),
          new TestEle('35.35', 'tbsdk_test 35', 35)
        ], 'TestEle', (ele: TestEle) => {
          return ele.age > 30
        }).subscribe()

        Storage.get<TestEle[]>('collection_test_12')
          .subscribeOn(Rx.Scheduler.async, 20)
          .skip(1)
          .subscribe(r => {
            expect(r.length).to.equal(3)
            expect(r[0].name).to.equal('tbsdk_test 36')
            done()
          })

        Storage.storeOne(new TestEle('36.36', 'tbsdk_test 36', 20))
          .subscribeOn(Rx.Scheduler.async, 20)
          .subscribe()

        Storage.updateOne('36.36', {
          age: 40
        })
          .subscribeOn(Rx.Scheduler.async, 30)
          .subscribe()
      })

      it('new ele add to collection updated, collection should be notified', done => {

        Storage.storeCollection('collection_test_13', [
          new TestEle('37.37', 'tbsdk_test 37', 37),
          new TestEle('38.38', 'tbsdk_test 35', 38)
        ], 'TestEle', (ele: TestEle) => {
          return ele.age > 30
        })
          .subscribe()

        Storage.get<TestEle[]>('collection_test_13')
          .subscribeOn(Rx.Scheduler.async, 10)
          .skip(2)
          .subscribe(r => {
            expect(r.length).to.equal(3)
            expect(r[0].name).to.equal('tbsdk_test 39.39')
            done()
          })

        Storage.storeOne(new TestEle('39.39', 'tbsdk_test 39', 20))
          .subscribeOn(Rx.Scheduler.async, 20)
          .subscribe()

        Storage.updateOne('39.39', {
          age: 40
        })
          .subscribeOn(Rx.Scheduler.async, 30)
          .subscribe()

        Storage.updateOne('39.39', {
          name: 'tbsdk_test 39.39'
        })
          .subscribeOn(Rx.Scheduler.async, 40)
          .subscribe()
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
        expect(err.message).to.equal('Can not store a existed data: collection_test_4')
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
      }
    ]

    Storage.storeCollection('collection_test_7', objEle)
      .subscribe()

    Storage.updateCollection('collection_test_7', colEle)
      .subscribeOn(Rx.Scheduler.async, 20)
      .subscribe()

    Storage.get<typeof objEle>('collection_test_7')
      .skip(1)
      .subscribeOn(Rx.Scheduler.async, 40)
      .subscribe(x => {
        expect(x).deep.equal(result)
        done()
      })

    Storage.updateOne('23.23', patchData)
      .subscribeOn(Rx.Scheduler.async, 50)
      .subscribe()

  })

})
