'use strict'
import { Scheduler } from 'rxjs'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import Database from '../../../src/storage/Database'
import { flush } from '../utils'

const expect = chai.expect
chai.use(sinonChai)

export default describe('database test: ', () => {

  let Storage: Database

  beforeEach(() => {
    flush()

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
      .skip(1)
      .subscribe(x => {
        expect(x).to.be.null
        done()
      })

    del.subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()
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

      get.subscribeOn(Scheduler.async, global.timeout1)
        .skip(1)
        .subscribe(r => {
          expect(r.data).to.equal(patchData.data)
          done()
        })

      update.subscribeOn(Scheduler.async, global.timeout2)
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
	    Storage.storeCollection('collection_test_1', data)
        .skip(1)
        .subscribe(r => {
          expect(r).to.deep.equal(patchData)
          done()
        })

      Storage.updateCollection('collection_test_1', patchData)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

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

      set.take(1)
        .concatMap(r => update)
        .concatMap(r => get.take(1))
        .subscribe(r => {
          expect(r).to.deep.equal(patchData)
          done()
        }, err => {
          console.log(err)
        })
    })

    it('patch data is not object should throw', done => {
      Storage.storeOne({
        _id: '14.14',
        data: 'tbsdk_test 14'
      }).subscribe()

      Storage.updateOne('14.14', '5555')
        .subscribeOn(Scheduler.async, global.timeout4)
        .subscribe(null, (err: Error) => {
          expect(err.message).to.equal(`A patch should be Object, patch: 5555, type: ${typeof '5555'}`)
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

      Storage.storeOne<typeof data>(data)
        .skip(1)
        .subscribe(r => {
          expect(r.data.data).to.equal(patch.data)
          done()
        })

      Storage.updateOne('21.21', patch)
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe()

    })

    it('child of obj is updated, parent should be notified', done => {
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
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r.child.data).to.equal('tbsdk_test 29.29')
          done()
        })

      Storage.updateOne('29.29', {
        data: 'tbsdk_test 29.29'
      })
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()
    })

    it('child of obj is updated to new one and the child is updated again, parent should be notified', done => {
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
        .skip(2)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r.child.data).to.equal('new one')
          done()
        })

      Storage.updateOne('28.28', {
        child: {
          _id: 'newOne',
          data: 'tbsdk_test new one'
        }
      })
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      Storage.updateOne('newOne', {
        data: 'new one'
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe()
    })

    it('stored child of obj updated, parent should be notified', done => {
      const childObj = {
        _id: '29.29',
        data: 'tbsdk_test 29'
      }

      const obj = {
        _id: '28.28',
        data: 'tbsdk_test 28',
        child: {
          _id: '29.29',
          data: 'tbsdk_test 29'
        }
      }

      Storage.storeOne(childObj)
        .subscribe()

      Storage.storeOne(obj)
        .skip(1)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r.child.data).to.equal('tbsdk_test 29.29')
          done()
        })

      Storage.updateOne('29.29', {
        data: 'tbsdk_test 29.29'
      })
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()
    })

    it('ele obj updated, collection include it should be notified', done => {
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
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()
    })

    it('stored ele obj updated, collection include it should be notified', done => {
      const obj = {
        _id: '30.30',
        data: 'tbsdk_test 30'
      }

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

      Storage.storeOne(obj)
        .concatMap(x => Storage.storeCollection('collection_test_10', col))
        .subscribe()

      Storage.get<typeof col>('collection_test_10')
        .subscribeOn(Scheduler.async, global.timeout1)
        .skip(1)
        .subscribe(r => {
          expect(r[0].data).to.equal('tbsdk_test 30.30')
          done()
        })

      Storage.updateOne('30.30', {
        data: 'tbsdk_test 30.30'
      })
        .subscribeOn(Scheduler.async, global.timeout2)
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
        .take(1)
        .concatMap(x => update)
        .concatMap(x => get.take(1))
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
          .subscribeOn(Scheduler.async, global.timeout1)
          .skip(1)
          .subscribe(r => {
            expect(r.length).to.equal(3)
            expect(r[0].name).to.equal('tbsdk_test 42')
            done()
          })

        Storage.storeOne(new TestEle('42.42', 'tbsdk_test 42', 42))
          .subscribeOn(Scheduler.async, global.timeout2)
          .subscribe()
      })

      it('after ele updated, collection should be updated', done => {

        Storage.storeCollection('collection_test_12', [
          new TestEle('34.34', 'tbsdk_test 34', 34),
          new TestEle('35.35', 'tbsdk_test 35', 35)
        ], 'TestEle', (ele: TestEle) => {
          return ele.age > 30
        }).subscribe()

        Storage.get<TestEle[]>('collection_test_12')
          .subscribeOn(Scheduler.async, global.timeout1)
          .skip(1)
          .subscribe(r => {
            expect(r.length).to.equal(3)
            expect(r[0].name).to.equal('tbsdk_test 36')
            done()
          })

        Storage.storeOne(new TestEle('36.36', 'tbsdk_test 36', 20))
          .subscribeOn(Scheduler.async, global.timeout2)
          .subscribe()

        Storage.updateOne('36.36', {
          age: 40
        })
          .subscribeOn(Scheduler.async, global.timeout3)
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
          .subscribeOn(Scheduler.async, global.timeout1)
          .skip(2)
          .subscribe(r => {
            expect(r.length).to.equal(3)
            expect(r[0].name).to.equal('tbsdk_test 39.39')
            done()
          })

        Storage.storeOne(new TestEle('39.39', 'tbsdk_test 39', 20))
          .subscribeOn(Scheduler.async, global.timeout2)
          .subscribe()

        Storage.updateOne('39.39', {
          age: 40
        })
          .subscribeOn(Scheduler.async, global.timeout3)
          .subscribe()

        Storage.updateOne('39.39', {
          name: 'tbsdk_test 39.39'
        })
          .subscribeOn(Scheduler.async, global.timeout4)
          .subscribe()
      })
    })

    it('update collection with empty array, old singals should be notified', done => {
      const objEle = [
        {
          _id: '24.24',
          data: 'tbsdk_test 24'
        }
      ]

      const colEle = []

      const result = []

      Storage.storeCollection('collection_test_15', objEle)
        .subscribe()

      Storage.updateCollection('collection_test_15', colEle)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      Storage.get<typeof objEle>('collection_test_15')
        .skip(1)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(x => {
          expect(x).deep.equal(result)
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
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      Storage.get<typeof objEle>('collection_test_7')
        .skip(1)
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(x => {
          expect(x).deep.equal(result)
          done()
        })

      Storage.updateOne('23.23', patchData)
        .subscribeOn(Scheduler.async, global.timeout4)
        .subscribe()

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
    Storage.storeCollection('collection_test_5', objEle)
      .subscribe()

    Storage.storeCollection('collection_test_6', colEle)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    Storage.get('collection_test_5')
      .subscribeOn(Scheduler.async, global.timeout2)
      .subscribe(r => {
        expect(r[0].data).to.equal(colEle[0].data)
        done()
      })
  })

  it('store empty collection should ok', done => {
    const empty = []

    Storage.storeCollection('collection_test_8', empty)
      .subscribe()

    Storage.storeCollection('collection_test_8', empty)
      .subscribe(r => {
        expect(r.length).to.equal(0)
        done()
      })
  })

  it('delete element from multi collections should ok', done => {
    Storage.storeCollection('collection_test_16', [
      {
        _id: '43.43',
        data: 'tbsdk_test 43'
      },
      {
        _id: '31.31',
        data: 'tbsdk_test 31'
      }
    ])
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(1)
      })

    Storage.storeCollection('collection_test_17', [
      {
        _id: '43.43',
        data: 'tbsdk_test 43'
      },
      {
        _id: '32.32',
        data: 'tbsdk_test 32'
      }
    ])
      .subscribeOn(Scheduler.async, global.timeout1)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(1)
      })

    Storage.storeCollection('collection_test_18', [
      {
        _id: '43.43',
        data: 'tbsdk_test 43'
      },
      {
        _id: '33.33',
        data: 'tbsdk_test 33'
      }
    ])
      .subscribeOn(Scheduler.async, global.timeout2)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(1)
        done()
      })

    Storage.delete('43.43')
      .subscribeOn(Scheduler.async, global.timeout3)
      .subscribe()
  })

  it('delete element from multi parents should ok', done => {
    Storage.storeOne({
      _id: '44.44',
      child: {
        _id: '45.45'
      }
    })
      .skip(1)
      .subscribe(r => {
        expect(r.child).to.be.undefined
      })

    Storage.storeOne({
      _id: '46.46',
      child: {
        _id: '45.45'
      }
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .skip(1)
      .subscribe(r => {
        expect(r.child).to.be.undefined
      })

    Storage.storeOne({
      _id: '47.47',
      child: {
        _id: '45.45'
      }
    })
      .subscribeOn(Scheduler.async, global.timeout2)
      .skip(1)
      .subscribe(r => {
        expect(r.child).to.be.undefined
        done()
      })

    Storage.delete('45.45')
      .subscribeOn(Scheduler.async, global.timeout3)
      .subscribe()
  })

  it('get object from database should be new object', done => {
    const data = {
      _id: '48.48',
      data: 'tbsdk_test 48'
    }
    Storage.storeOne(data)
      .subscribe(r => {
        expect(r).to.not.equal(data)
        done()
      })
  })

  it('get collection from database should be new Array', done => {
    const data = [
      {
        _id: '49.49',
        data: 'tbsdk_test 49'
      },
      {
        _id: '50.50',
        data: 'tbsdk_test 50'
      }
    ]

    Storage.storeCollection('collection_test_19', data)
      .subscribe(r => {
        expect(r).to.not.equal(data)
        data.forEach((val, index) => {
          expect(val).to.not.equal(r[index])
        })
        done()
      })
  })

})
