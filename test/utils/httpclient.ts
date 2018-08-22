import { expect } from 'chai'
import { it, describe } from 'tman'
import { TaskId } from 'teambition-types'
import { normBulkUpdate } from '../../src/utils'

describe('httpclient utils spec', () => {

  type ResponsePayload = {
    taskIds: TaskId[]
    isArchived: boolean
    updated: string
  }

  it('normBoldUpdate should produce [] for undefined response', () => {
    const norm = normBulkUpdate<any>('taskIds', '_id')
    expect(norm(undefined)).to.deep.equal([])
    expect(norm(null)).to.deep.equal([])
    expect(norm('success')).to.deep.equal([])
  })

  it('normBulkUpdate should produce [] when responseIdsField is undefined', () => {
    const norm = normBulkUpdate<any>('_taskIds', '_id')
    expect(norm({
      taskIds: ['123', '456'],
      isArchived: true,
      updated: '2018-08-21T05:43:10.000Z'
    })).to.deep.equal([])
  })

  it('normBulkUpdate should produce [] when responseIdsField is empty', () => {
    const norm = normBulkUpdate<ResponsePayload>('taskIds', '_id')
    expect(norm({
      taskIds: [],
      isArchived: true,
      updated: '2018-08-21T05:43:10.000Z'
    })).to.deep.equal([])
  })

  it('normBulkUpdate should work when responseIdsField and entityIdField are the same', () => {
    const norm = normBulkUpdate<any>('_id', '_id')
    expect(norm({
      _id: ['123' as TaskId, '456' as TaskId],
      isArchived: true,
      updated: '2018-08-21T05:43:10.000Z'
    })).to.deep.equal([
      { _id: '123', isArchived: true, updated: '2018-08-21T05:43:10.000Z' },
      { _id: '456', isArchived: true, updated: '2018-08-21T05:43:10.000Z' }
    ])
  })

  it('normBulkUpdate should work when responseIdsField and entityIdField are different', () => {
    const norm = normBulkUpdate<ResponsePayload>('taskIds', '_id')
    expect(norm({
      taskIds: ['123' as TaskId, '456' as TaskId],
      isArchived: true,
      updated: '2018-08-21T05:43:10.000Z'
    })).to.deep.equal([
      { _id: '123', isArchived: true, updated: '2018-08-21T05:43:10.000Z' },
      { _id: '456', isArchived: true, updated: '2018-08-21T05:43:10.000Z' }
    ])
  })

  it('normBulkUpdate should not overwrite when property conflict happends', () => {
    const norm = normBulkUpdate<any>(
      'taskIds',
      'cid'       // 语义为 backbone 的 client id
    )
    expect(norm({
      taskIds: ['123', '456'],
      cid: '789', // 语义为 child id
      isArchived: true,
      updated: '2018-08-21T05:43:10.000Z'
    })).to.deep.equal([
      { cid: '789', isArchived: true, updated: '2018-08-21T05:43:10.000Z' },
      { cid: '789', isArchived: true, updated: '2018-08-21T05:43:10.000Z' }
    ])
  })

})
