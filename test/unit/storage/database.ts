'use strict'
import * as Rx from 'rxjs'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {forEach} from '../index'
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

  // it('database expire should ok', done => {
  //   const data = {
  //     _id: '2222',
  //     data: 'tbsdk_test 2'
  //   }
  //   Storage.set('2222', data, 200)
  //   .then(() => {
  //     return Storage.get('2222').then(result => {
  //       forEach(data, (val, key) => {
  //         expect(val).to.equal(result[key])
  //       })
  //     })
  //   })
  //   .then(() => {
  //     return new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         resolve()
  //       }, 50)
  //     })
  //   })
  //   .then(() => {
  //     return Storage.get('2222').then(result => {
  //       forEach(data, (val, key) => {
  //         expect(val).to.equal(result[key])
  //       })
  //     })
  //   })
  //   .then(() => {
  //     return new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         resolve()
  //       }, 210)
  //     })
  //   })
  //   .then(() => {
  //     return Storage.get('2222').then(result => {
  //       expect(result).to.be.undefined
  //       done()
  //     })
  //   })
  //   .catch((e) => {
  //     console.error(e)
  //     done()
  //   })
  // })

  it('database delete should ok', done => {
    const data = {
      _id: '3333',
      data: 'tbsdk_test 3'
    }
    const set = Storage.set('3333', data)

    const del = Storage.delete('3333')

    const get = Storage.get('3333')

    Rx.Observable.combineLatest(set, get, del)
      .subscribe(x => {
        expect(x.pop()).to.be.null
        done()
      })
  })


  // describe('update should ok', () => {
  //   it('update object should ok', done => {
  //     const data = {
  //       _id: '5555',
  //       data: 'tbsdk_test 5'
  //     }
  //     const patchData = {
  //       data: 'tbsdk_test 6'
  //     }
  //     Storage.set('5555', data)
  //     .then(() => {
  //       return Storage.update('5555', patchData)
  //     })
  //     .then(() => {
  //       return Storage.get<typeof data>('5555')
  //       .then(result => {
  //         expect(result.data).to.equal(patchData.data)
  //         done()
  //       })
  //     })
  //   })

  //   it('update collection exist ele should ok', () => {
  //     const data = [
  //       {
  //         _id: '6666',
  //         data: 'tbsdk_test 6'
  //       },
  //       {
  //         _id: '7777',
  //         data: 'tbsdk_test 7'
  //       }
  //     ]
  //     const patchData = [
  //       {
  //         _id: '6666',
  //         data: 'tbsdk_test 66'
  //       },
  //       {
  //         _id: '7777',
  //         data: 'tbsdk_test 77'
  //       }
  //     ]
	//     Storage.set('collection_test_1', data)
  //     .then(() => {
  //       return Storage.update('collection_test_1', patchData)
  //     })
  //     .then(() => {
  //       return Storage.get<typeof data>('collection_test_1')
  //       .then(result => {
  //         forEach(patchData, (value, index) => {
  //           forEach(value, (val, key) => {
  //             expect(val).to.equal(result[index][key])
  //           })
  //         })
  //       })
  //     })
  //   })

  //   it('update collection not exist ele should ok', () => {
  //     const data = [
  //       {
  //         _id: '8888',
  //         data: 'tbsdk_test 8'
  //       },
  //       {
  //         _id: '9999',
  //         data: 'tbsdk_test 9'
  //       }
  //     ]
  //     const patchData = [
  //       {
  //         _id: '9999',
  //         data: 'tbsdk_test 99'
  //       },
  //       {
  //         _id: '1010',
  //         data: 'tbsdk_test 1.0'
  //       },
  //       {
  //         _id: '8888',
  //         data: 'tbsdk_test 88'
  //       },
  //       {
  //         _id: '11.11',
  //         data: 'tbsdk_test 1.1'
  //       }
  //     ]

	//     Storage.set('collection_test_2', data)
  //     .then(() => {
  //       return Storage.update('collection_test_2', patchData)
  //     })
  //     .then(() => {
  //       return Storage.get<typeof data>('collection_test_2')
  //       .then(result => {
  //         forEach(patchData, (value, index) => {
  //           forEach(value, (val, key) => {
  //             expect(val).to.equal(result[index][key])
  //           })
  //         })
  //       })
  //     })

  //   })

  //   it('patch data to collection is not Array should return undefined', () => {
  //     const data = [
  //       {
  //         _id: '12.12',
  //         data: 'tbsdk_test 12'
  //       },
  //       {
  //         _id: '13.13',
  //         data: 'tbsdk_test 13'
  //       }
  //     ]
	//     Storage.set('collection_test_3', data)
  //     .then(() => {
  //       return Storage.update('collection_test_3', {
  //         _id: 'collection_test_3',
  //         data: 'tbsdk_test 13'
  //       })
  //     })
  //     .then(result => {
  //       expect(result).to.be.undefined
  //     })
  //   })

  //   it('patch data is not object should throw', (done) => {
  //     Storage.set('14.14', {
  //       _id: '14.14',
  //       data: 'tbsdk_test 14'
  //     })
  //     .then(() => {
  //       return Storage.update('14.14', '5555')
  //     })
  //     .catch(e => {
  //       expect(e).to.equal('A patch should be Object')
  //       done()
  //     })
  //   })

  //   it('update object expire should ok', (done) => {
  //     const data = {
  //       _id: '15.15',
  //       data: 'tbsdk_test 15'
  //     }
  //     Storage.set('15.15', data, 50)
  //     .then(() => {
  //       setTimeout(() => {
  //         Storage.get<typeof data>('15.15').then(result => {
  //           forEach(data, (val, key) => {
  //             expect(result[key]).to.deep.equal(val)
  //           })
  //           Storage.update('15.15', {
  //             expire: 100
  //           })
  //         })
  //       }, 25)
  //       setTimeout(() => {
  //         Storage.get<typeof data>('15.15').then(result => {
  //           forEach(data, (val, key) => {
  //             expect(result[key]).to.deep.equal(val)
  //           })
  //         })
  //       }, 100)
  //       setTimeout(() => {
  //         Storage.get<typeof data>('15.15').then(result => {
  //           expect(result).to.be.undefined
  //           done()
  //         })
  //       }, 300)
  //     })
  //   })

  //   it('patch target not exist should return undefined', () => {
  //     Storage.update('teambtion', {
  //       _id: 'teambtion',
  //       data: 'tbsdk_test teambtion'
  //     }).then(result => {
  //       expect(result).to.be.undefined
  //     })
  //   })

  //   it('patch object exist in other object should ok', () => {
  //     const data = {
  //       _id: '20.20',
  //       data: {
  //         _id: '21.21',
  //         data: 'tbsdk_test 21'
  //       }
  //     }
  //     const patch = {
  //       data: 'tbsdk_test 21.21'
  //     }
  //     let res: typeof data
  //     Storage.set('20.20', data)
  //     .then(() => {
  //       return Storage.get<typeof data>('20.20')
  //     })
  //     .then(result => {
  //       res = result
  //       return Storage.update('21.21', patch)
  //     })
  //     .then(() => {
  //       expect(res.data.data).to.equal(patch.data)
  //     })
  //   })
  // })

  // it('store exist collection should return undefined', () => {
  //   Storage.set('collection_test_4', [
  //     {
  //       _id: '16.16',
  //       data: 'tbsdk_test 16'
  //     }
  //   ])
  //   .then(() => {
  //     Storage.set('collection_test_4', [
  //       {
  //         _id: '17.17',
  //         data: 'tbsdk_test 17'
  //       }
  //     ])
  //     .then(result => {
  //       expect(result).to.be.undefined
  //     })
  //   })
  // })

  // it('store collection that include exist object, the old one should be updated', () => {
  //   const objEle = [
  //     {
  //       _id: '18.18',
  //       data: 'tbsdk_test 18'
  //     },
  //     {
  //       _id: '20.20',
  //       data: 'tbsdk_test 20'
  //     }
  //   ]
  //   const colEle = [
  //     {
  //       _id: '18.18',
  //       data: 'tbsdk_test 18.18'
  //     },
  //     {
  //       _id: '19.19',
  //       data: 'tbsdk_test 19.19'
  //     }
  //   ]
  //   Storage.set('collection_test_5', objEle)
  //   .then(() => {
  //     return Storage.set('collection_test_6', colEle)
  //   })
  //   .then(() => {
  //     return Storage.get<typeof objEle>('collection_test_5')
  //     .then(result => {
  //       expect(result[0].data).to.equal(colEle[0].data)
  //     })
  //   })
  // })
})
