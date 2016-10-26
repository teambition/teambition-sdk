'use strict'
import * as chai from 'chai'
import Model from '../../../src/storage/Model'
import Data from '../../../src/storage/Map'
import { dataToSchema, forEach, clone } from '../index'
import { modelMock } from '../../mock/modelMock'
import * as Schemas from '../../../src/schemas/schemaFactory'
import { expectDeepEqual, notInclude } from '../utils'

const expect = chai.expect

export default describe('storage Model test: ', () => {
  let schema: Schemas.TaskSchema
  let model: Model<Schemas.TaskSchema>

  beforeEach(() => {
    Data.clear()

    schema = dataToSchema<Schemas.TaskSchema>(<any>clone(modelMock), Schemas.TaskSchema)
    model = new Model(<any>schema)
  })

  it('new model should ok', () => {
    forEach(modelMock, (v, k) => {
      if (k !== 'subtasks') {
        expect(v).to.deep.equal(model.data[k])
      } else {
        forEach(modelMock.subtasks, (subtask, p) => {
          expectDeepEqual(subtask, model.data.subtasks[p])
        })
      }
    })
  })

  it('get schema name should ok', () => {
    expect(model.data.$$schemaName).to.equal('Task')
  })

  it('get data should ok', done => {
    model.get()
      .take(1)
      .subscribe(r => {
        forEach(modelMock, (val, key) => {
          if (key !== 'subtasks') {
            expect(val).to.deep.equal(r[key])
          } else {
            forEach(modelMock.subtasks, (subtask, pos) => {
              expectDeepEqual(subtask, r.subtasks[pos])
            })
          }
        })
        done()
      })
  })

  it('update should ok', done => {
    const patch = {
      subtasks: [
        {
          _id: 'mock1',
          data: 'mock.1'
        },
        {
          _id: 'mock2',
          data: 'mock.2'
        },
        clone(modelMock.subtasks[0])
      ]
    }
    model.update(patch)
      .subscribe(r => {
        forEach(patch.subtasks, (subtask, pos) => {
          expectDeepEqual(subtask, r.subtasks[pos])
        })
        done()
      })
  })

  it('notify should ok', done => {
    model.get()
      .skip(1)
      .subscribe(r => {
        expect(r.content).to.equal('mockcontent')
        done()
      })

    model.update({
      content: 'mockcontent'
    })
      .subscribe(r => {
        model.notify()
      })
  })

  it('addToCollection should ok', () => {
    model.addToCollection('mock_collection_1')
    model.addToCollection('mock_collection_2')
    model.addToCollection('mock_collection_1')
    expect(model.collections).to.deep.equal([
      'mock_collection_2',
      'mock_collection_1'
    ])
  })

  it('remove from collection should ok', () => {
    model.addToCollection('mock_collection_1')
    model.addToCollection('mock_collection_2')
    model.addToCollection('mock_collection_3')
    model.addToCollection('mock_collection_4')
    model.removeFromCollection('mock_collection_1')
    expect(model.collections).to.deep.equal([
      'mock_collection_4',
      'mock_collection_3',
      'mock_collection_2'
    ])
  })

  it('add parent should ok', () => {
    model.addParent('mockparent1')
    model.addParent('mockparent2')
    model.addParent('mockparent2')

    expect(model.parents).to.deep.equal([
      'mockparent1',
      'mockparent2'
    ])
  })

  it('remove parent should ok', () => {
    model.addParent('mockparent1')
    model.addParent('mockparent2')
    model.addParent('mockparent3')
    model.addParent('mockparent4')
    model.addParent('mockparent5')

    model.removeParent('mockparent2')

    expect(model.parents).to.deep.equal([
      'mockparent1',
      'mockparent3',
      'mockparent4',
      'mockparent5'
    ])
  })

  it('add children should ok', () => {
    const originChildren = clone(model.children);
    [1, 2, 3, 4, 5].forEach((v, p) => {
      model.addChildren(`mockchild${v}`, {
        key: 'mockchildren',
        pos: p
      })
    })
    expect(model.children).to.deep.equal(
      originChildren.concat( [1, 2, 3, 4, 5].map(v => `mockchild${v}`) )
    )
  })

  it('remove child should ok', () => {
    const length = model.children.length
    model.removeChild(modelMock.subtasks[3]._id)
    expect(model.children.length).to.equal(length - 1)
    expect(notInclude(model.data.subtasks, modelMock.subtasks[3])).to.be.true
  })

})
