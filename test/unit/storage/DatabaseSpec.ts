'use strict'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import Database from '../../../src/storage/Database'
import { clone, dataToSchema, forEach } from '../index'
import { Schema, setSchema, child } from '../../../src/schemas/schema'
import TaskSchema from '../../../src/schemas/Task'
import SubtaskSchema from '../../../src/schemas/Subtask'
import ObjectLinkSchema from '../../../src/schemas/ObjectLink'
import { objectLinks } from '../../mock/objectLinks'
import { modelMock } from '../../mock/modelMock'
import { organizationMySubtasks } from '../../mock/organizationMySubtasks'
import { flush } from '../utils'

const expect = chai.expect
chai.use(sinonChai)

export default describe('database test: ', () => {

  let Storage: Database

  beforeEach(() => {
    flush()

    Storage = new Database()
  })

  it('database storeOne/getOne should ok', function* () {
    const data = {
      _id: '1111',
      data: 'tbsdk_test 1'
    }
    yield Storage.storeOne(data)
      .take(1)
      .forEach(res => {
        expect(res).to.deep.equal(data)
      })
  })

  it('database delete should ok', function* () {
    const data = {
      _id: '3333',
      data: 'tbsdk_test 3'
    }

    yield Storage.storeOne(data).take(1)

    const stream = Storage.get('3333')
      .publish()
      .refCount()

    yield Storage.delete('3333')

    stream.take(1).do(x => {
      expect(x).to.be.null
    })
  })

  describe('update should ok: ', () => {
    it('update object should ok', function* () {
      const data = {
        _id: '5555',
        data: 'tbsdk_test 5'
      }
      const patchData = {
        data: 'tbsdk_test 6'
      }

      yield Storage.storeOne<typeof data>(data).take(1)

      const stream = Storage.get<typeof data>('5555')
        .publish()
        .refCount()

      yield Storage.updateOne('5555', patchData)

      yield stream.take(1)
        .do(r => {
          expect(r.data).to.equal(patchData.data)
        })
    })

    it('update collection exist ele should ok', function* () {
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

      yield Storage.storeCollection('collection_test_1', data).take(1)

      const stream = Storage.get('collection_test_1')
        .publish()
        .refCount()

      yield stream.take(1)

      yield Storage.updateCollection('collection_test_1', patchData)

      yield stream.take(1).do(r => {
        expect(r).to.deep.equal(patchData)
      })
    })

    it('update collection not exist ele should ok', function* () {
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
        .publish()
        .refCount()

      yield set.take(1)

      yield Storage.updateCollection('collection_test_2', patchData)

      yield Storage.get<typeof data>('collection_test_2')
        .take(1)
        .forEach(r => {
          expect(r).to.deep.equal(patchData)
        })
    })

    it('patch data is not object should throw', function* () {
      yield Storage.storeOne({
        _id: '14.14',
        data: 'tbsdk_test 14'
      }).take(1)

      yield Storage.updateOne('14.14', '5555')
        .toPromise()
        .catch((err: Error) => {
          expect(err.message).to.equal(`A patch should be Object, patch: 5555, type: ${typeof '5555'}`)
        })
    })

    it('patch target not exist should throw', function* () {
      yield Storage.updateOne('teambtion', {
        _id: 'teambtion',
        data: 'tbsdk_test teambtion'
      })
        .toPromise()
        .catch(err => {
          expect(err.message).to.equal('Patch target not exist: teambtion')
        })
    })

    it('patch object exist in other object should ok', function* () {
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

      const stream = Storage.storeOne<typeof data>(data)
        .publish()
        .refCount()

      yield stream.take(1)

      yield Storage.updateOne('21.21', patch)

      yield stream.take(1).do(r => {
        expect(r.data.data).to.equal(patch.data)
      })
    })

    it('child of obj is updated, parent should be notified', function* () {
      const obj = {
        _id: '28.28',
        data: 'tbsdk_test 28',
        child: {
          _id: '29.29',
          data: 'tbsdk_test 29'
        }
      }

      yield Storage.storeOne(obj).take(1)

      const stream = Storage.get<typeof obj>('28.28')
        .publish()
        .refCount()

      yield Storage.updateOne('29.29', {
        data: 'tbsdk_test 29.29'
      })

      yield stream.take(1).do(r => {
        expect(r.child.data).to.equal('tbsdk_test 29.29')
      })
    })

    it('child of obj is updated to new one and the child is updated again, parent should be notified', function* () {
      const obj = {
        _id: '28.28',
        data: 'tbsdk_test 28',
        child: {
          _id: '29.29',
          data: 'tbsdk_test 29'
        }
      }

      const stream = Storage.get<typeof obj>('28.28')
        .publish()
        .refCount()

      yield Storage.storeOne(obj).take(1)

      yield Storage.updateOne('28.28', {
        child: {
          _id: 'newOne',
          data: 'tbsdk_test new one'
        }
      })

      yield stream.take(1).do(r => expect(r.child.data).to.equal('tbsdk_test new one'))

      yield Storage.updateOne('newOne', {
        data: 'new one'
      })

      yield stream.take(1).do(r => expect(r.child.data).to.equal('new one'))
    })

    it('stored child of obj updated, parent should be notified', function* () {
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

      yield Storage.storeOne(childObj).take(1)

      const stream = Storage.storeOne(obj)
        .publish()
        .refCount()

      yield Storage.updateOne('29.29', {
        data: 'tbsdk_test 29.29'
      })

      yield stream.take(1)
        .do(r => {
          expect(r.child.data).to.equal('tbsdk_test 29.29')
        })
    })

    it('ele obj updated, collection include it should be notified', function*() {
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

      yield Storage.storeCollection('collection_test_10', col).take(1)

      yield Storage.updateOne('31.31', {
        data: 'tbsdk_test 31.31'
      })

      yield Storage.get<typeof col>('collection_test_10')
        .take(1)
        .do(r => {
          expect(r[1].data).to.equal('tbsdk_test 31.31')
        })
    })

    it('stored ele obj updated, collection include it should be notified', function* () {
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

      yield Storage.storeOne(obj).take(1)

      yield Storage.storeCollection('collection_test_10', col).take(1)

      const stream = Storage.get<typeof col>('collection_test_10')
        .publish()
        .refCount()

      yield Storage.updateOne('30.30', {
        data: 'tbsdk_test 30.30'
      })

      yield stream.take(1)
        .do(r => {
          expect(r[0].data).to.equal('tbsdk_test 30.30')
        })
    })

    it('update ele in condition collection should ok', function* () {
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

      yield Storage.storeCollection('collection_test_11', col, 'schema_test', (x: any) => {
        return parseInt(x.data.split(' ').pop(), 10) < 50
      }).take(1)

      yield Storage.updateOne('33.33', {
        data: 'tbsdk_test 80'
      })

      yield Storage.get<any[]>('collection_test_11').take(1)
        .do(r => {
          expect(r.length).to.equal(1)
          expect(r[0]._id).to.equal('32.32')
        })
    })

    describe('change ele to satisfy collection condition: ', () => {
      class TestEle {
        $$schemaName = 'TestEle'
        constructor(public _id: string, public name: string, public age: number) {}
      }

      it('collection should be updated', function* () {
        yield Storage.storeCollection('collection_test_14', [
          new TestEle('40.40', 'tbsdk_test 40', 40),
          new TestEle('41.41', 'tbsdk_test 41', 41)
        ], 'TestEle', (ele: TestEle) => {
          return ele.age > 30
        }).take(1)

        yield Storage.storeOne(new TestEle('42.42', 'tbsdk_test 42', 42))
          .take(1)

        yield Storage.get<TestEle[]>('collection_test_14')
          .take(1)
          .do(r => {
            expect(r.length).to.equal(3)
            expect(r[0].name).to.equal('tbsdk_test 42')
          })
      })

      it('after ele updated, collection should be updated', function* () {

        yield Storage.storeCollection('collection_test_12', [
          new TestEle('34.34', 'tbsdk_test 34', 34),
          new TestEle('35.35', 'tbsdk_test 35', 35)
        ], 'TestEle', (ele: TestEle) => {
          return ele.age > 30
        }).take(1)

        yield Storage.storeOne(new TestEle('36.36', 'tbsdk_test 36', 20))
          .take(1)

        yield Storage.updateOne('36.36', {
          age: 40
        })

        yield Storage.get<TestEle[]>('collection_test_12')
          .take(1)
          .do(r => {
            expect(r.length).to.equal(3)
            expect(r[0].name).to.equal('tbsdk_test 36')
          })
      })

      it('new ele add to collection updated, collection should be notified', function* () {

        yield Storage.storeCollection('collection_test_13', [
          new TestEle('37.37', 'tbsdk_test 37', 37),
          new TestEle('38.38', 'tbsdk_test 35', 38)
        ], 'TestEle', (ele: TestEle) => {
          return ele.age > 30
        }).take(1)

        yield Storage.storeOne(new TestEle('39.39', 'tbsdk_test 39', 20))
          .take(1)

        yield Storage.updateOne('39.39', {
          age: 40
        })

        yield Storage.get('collection_test_13')
          .take(1)
          .do(r => {
            expect(r[0].age).to.equal(40)
          })

        yield Storage.updateOne('39.39', {
          name: 'tbsdk_test 39.39'
        })

        yield Storage.get<TestEle[]>('collection_test_13')
          .take(1)
          .do(r => {
            expect(r.length).to.equal(3)
            expect(r[0].name).to.equal('tbsdk_test 39.39')
          })
      })
    })

    it('update collection with empty array, old singals should be notified', function* () {
      const objEle = [
        {
          _id: '24.24',
          data: 'tbsdk_test 24'
        }
      ]

      const colEle = []

      const result = []

      yield Storage.storeCollection('collection_test_15', objEle)
        .take(1)

      yield Storage.updateCollection('collection_test_15', colEle)

      yield Storage.get<typeof objEle>('collection_test_15')
        .take(1)
        .do(x => {
          expect(x).deep.equal(result)
        })
    })

    it('update empty collection should ok', function* () {
      yield Storage.storeCollection('collection_test_20', []).take(1)

      yield Storage.updateCollection('collection_test_20', [
        {
          _id: '51.51',
          data: 'tbsdk_test 51'
        }
      ])

      yield Storage.get<any[]>('collection_test_20')
        .take(1)
        .do(r => {
          expect(r.length).to.equal(1)
        })
    })

    it('update collection and new item updated, old singals should be notified', function* () {
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

      yield Storage.storeCollection('collection_test_7', objEle).take(1)

      const stream = Storage.get<typeof objEle>('collection_test_7')
        .publish()
        .refCount()

      yield Storage.updateCollection('collection_test_7', colEle)

      yield stream.take(1).do(r => {
        expect(r).to.deep.equal(colEle)
      })

      yield Storage.updateOne('23.23', patchData)

      yield stream
        .take(1)
        .do(x => {
          expect(x).deep.equal(result)
        })
    })

  })

  it('store exist collection should throw', function* () {
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

    yield set1.take(1)

    yield set2.take(1)
      .toPromise()
      .catch(err => {
        expect(err.message).to.equal('Can not store a existed data: collection_test_4')
      })
  })

  it('store collection that include exist object, the old one should be updated', function* () {
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
    yield Storage.storeCollection('collection_test_5', objEle)
      .take(1)

    yield Storage.storeCollection('collection_test_6', colEle)
      .take(1)

    yield Storage.get('collection_test_5')
      .take(1)
      .do(r => {
        expect(r[0].data).to.equal(colEle[0].data)
      })
  })

  it('store empty collection should ok', function* () {
    const empty = []

    yield Storage.storeCollection('collection_test_8', empty)
      .take(1)

    yield Storage.storeCollection('collection_test_8', empty)
      .take(1)
      .do(r => {
        expect(r.length).to.equal(0)
      })
  })

  it('delete element from multi collections should ok', function* () {

    yield Storage.storeCollection('collection_test_16', [
      {
        _id: '43.43',
        data: 'tbsdk_test 43'
      },
      {
        _id: '31.31',
        data: 'tbsdk_test 31'
      }
    ]).take(1)

    const stream = Storage.get('collection_test_16')
      .publish()
      .refCount()

    yield Storage.storeCollection('collection_test_17', [
      {
        _id: '43.43',
        data: 'tbsdk_test 43'
      },
      {
        _id: '32.32',
        data: 'tbsdk_test 32'
      }
    ]).take(1)

    const stream2 = Storage.get('collection_test_17')
      .publish()
      .refCount()

    yield Storage.storeCollection('collection_test_18', [
      {
        _id: '43.43',
        data: 'tbsdk_test 43'
      },
      {
        _id: '33.33',
        data: 'tbsdk_test 33'
      }
    ])
      .take(1)

    yield Storage.delete('43.43')

    yield [
      stream.take(1)
        .do((r: any[]) => {
          expect(r.length).to.equal(1)
        }),
      stream2.take(1)
        .do((r: any[]) => {
          expect(r.length).to.equal(1)
        }),
      Storage.get('collection_test_18')
        .take(1)
        .do((r: any[]) => {
          expect(r.length).to.equal(1)
        })
    ]
  })

  it('delete element from multi parents should ok', function* () {
    yield Storage.storeOne({
      _id: '44.44',
      child: {
        _id: '45.45'
      }
    })
      .take(1)

    const stream1 = Storage.get('44.44')
      .publish()
      .refCount()

    yield Storage.storeOne({
      _id: '46.46',
      child: {
        _id: '45.45'
      }
    })
      .take(1)

    const stream2 = Storage.get('46.46')
      .publish()
      .refCount()

    yield Storage.storeOne({
      _id: '47.47',
      child: {
        _id: '45.45'
      }
    })
      .take(1)

    yield Storage.delete('45.45')

    yield [
      Storage.get('47.47')
        .take(1)
        .do((r: any) => {
          expect(r.child).to.be.undefined
        }),
      stream1.take(1)
        .do((r: any) => {
          expect(r.child).to.be.undefined
        }),
      stream2.take(1)
        .do((r: any) => {
          expect(r.child).to.be.undefined
        })
    ]
  })

  it('get object from database should be new object', function* () {
    const data = {
      _id: '48.48',
      data: 'tbsdk_test 48'
    }
    yield Storage.storeOne(data)
      .take(1)
      .do(r => {
        expect(r).to.not.equal(data)
      })
  })

  it('get collection from database should be new Array', function* () {
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

    yield Storage.storeCollection('collection_test_19', data)
      .take(1)
    yield Storage.get<typeof data>('collection_test_19')
      .take(1)
      .do(r => {
        expect(r).to.not.equal(data)
        data.forEach((val, index) => {
          expect(val).to.not.equal(r[index])
        })
      })
  })

  describe('schema data test: ', () => {

    it('element should be deleted when bloody parent has been deleted', function* () {
      const subtasks = clone(modelMock.subtasks)
      class TestSchema extends Schema<{
        _id: string
        name: string
        subtasks: any[]
      }> {
        _id: string = undefined
        name: string = undefined
        @child('Array', 'Subtask') subtasks: any[] = []
      }
      const _id = subtasks[0]._taskId

      const testSchema = setSchema(new TestSchema(), {
        _id: _id,
        name: 'mocktestschema 1',
        subtasks: subtasks
      })

      yield Storage.storeOne(testSchema).take(1)

      yield Storage.storeCollection(`task:subtasks/${testSchema._id}`, subtasks)
        .take(1)

      const stream = Storage.get(`task:subtasks/${testSchema._id}`)
        .publish()
        .refCount()

      yield Storage.delete(_id)

      yield stream.take(1)
        .do((r: any[]) => {
          expect(r.length).to.equal(0)
        })
    })

    it('bloodyParentWithProperty should ok', function* () {
      const objectLinkData = objectLinks[0]
      const task = clone(modelMock)
      task._id = objectLinkData._parentId

      const taskSchema = dataToSchema(clone(task), TaskSchema)
      const objectLinkSchema = dataToSchema(clone(objectLinkData), ObjectLinkSchema)

      yield Storage.storeOne(taskSchema).take(1)

      yield Storage.storeOne(objectLinkSchema)
        .take(1)

      yield Storage.delete(taskSchema._id)

      yield Storage.get<ObjectLinkSchema>(objectLinkSchema._id)
        .take(1)
        .do(r => {
          expect(r).to.be.null
        })
    })

    it('circular dependencies should ok', function* () {
      const subtask = clone(organizationMySubtasks[0])
      const taskSchema = dataToSchema(clone(modelMock), TaskSchema)
      const subtaskSchema = dataToSchema(subtask, SubtaskSchema)

      yield Storage.storeOne(subtaskSchema).take(1)

      yield Storage.storeOne(taskSchema)
        .take(1)

      const stream = Storage.get<TaskSchema>(taskSchema._id)
        .publish()
        .refCount()

      yield Storage.updateOne(subtask._id, {
        content: 'circular update'
      })

      yield stream.take(1)
        .do(r => {
          forEach(r.subtasks, _subtask => {
            if (_subtask._id === subtask._id) {
              expect(_subtask.content).to.equal('circular update')
            }
          })
        })

    })

    it('get data from cache after it cached should ok', function* () {
      class TestSchema extends Schema<any> {
        _id: string = undefined
        name: string = undefined
        project: {
          _id: string
          name: string
        } = undefined
      }

      class ProjectSchema extends Schema<any> {
        _id: string = undefined
        name: string = undefined
        logo: string = undefined
      }

      const testSchema = setSchema(new TestSchema(), {
        _id: 'mocktestschema2',
        name: 'mocktestschema 2',
        project: {
          _id: 'mockprojecttest',
          name: 'mock project test'
        }
      })

      const projectSchema = setSchema(new ProjectSchema(), {
        _id: 'mockprojecttest',
        name: 'mock project test',
        logo: 'https:/api.teambition.com/logo/1'
      })

      yield Storage.storeOne(testSchema).take(1)

      yield Storage.storeOne(projectSchema)
        .take(1)
        .do(r => {
          expect(testSchema.$$data.project.checkSchema()).to.be.true
        })
    })
  })

})
