import { describe, it } from 'tman'
import { expect } from 'chai'
import { schemaColl } from '../../src/SDK'
import tableAlias from '../../src/sockets/TableAlias'
import { TableInfoByMessageType } from '../../src/sockets/MapToTable'
import { SchemaCollection } from '../../src/schemas'

describe('TableInfoByMessageType spec', () => {

  const schemaColl = new SchemaCollection()

  const schemas = [
    { name: 'Task', schema: { _id: { primaryKey: true } } },
    { name: 'Event', schema: { _id: { primaryKey: true } } },
    { name: 'Activity', schema: { _id: { primaryKey: true } } },
    { name: 'CustomFieldLink', schema: { _id: { primaryKey: true } } },
    { name: 'Alias', schema: { _id: { primaryKey: true } } }
  ]

  schemas.forEach((schemaInfo: any) => {
    schemaColl.add(schemaInfo)
  })

  const mapToTable = new TableInfoByMessageType(schemaColl, {
    'Alias': 'Task',
    'job': 'Task'
  })

  it('should map a normal message `type` or `Type` to its table info', () => {
    const target = { pkName: '_id', tabName: 'Task' }
    expect(mapToTable.getTableInfo('task')).to.deep.equal(target)
    expect(mapToTable.getTableInfo('Task')).to.deep.equal(target)
  })

  it('should map a normal message `type`(case-insensitive) to its table info', () => {
    const target = { pkName: '_id', tabName: 'CustomFieldLink' }
    expect(mapToTable.getTableInfo('CustomfieldLink')).to.deep.equal(target)
    expect(mapToTable.getTableInfo('customfieldLink')).to.deep.equal(target)
    expect(mapToTable.getTableInfo('customfieldlink')).to.deep.equal(target)
    expect(mapToTable.getTableInfo('CUSTOMFIELDLINK')).to.deep.equal(target)
  })

  it('should map a plural form message `types` or `Types` to its table info', () => {
    const target = { pkName: '_id', tabName: 'Event' }
    expect(mapToTable.getTableInfo('events')).to.deep.equal(target)
    expect(mapToTable.getTableInfo('Events')).to.deep.equal(target)
  })

  it('should return null when no table info is defined for the message `type-ies`', () => {
    expect(mapToTable.getTableInfo('activities')).to.be.null
  })

  it('should allow `alias`(case-insensitive) to take precedence', () => {
    const target = { pkName: '_id', tabName: 'Task' }
    expect(mapToTable.getTableInfo('alias')).to.deep.equal(target)
    expect(mapToTable.getTableInfo('aliAs')).to.deep.equal(target)
  })

  // 走别名匹配的代码路径，等于放弃进行自动的复数变单数转换，单复数别名条目
  // 需要用户自行添加。
  it('should not cut trailing `s` during alias matching', () => {
    expect(mapToTable.getTableInfo('jobs')).to.be.null
    expect(mapToTable.getTableInfo('job')).to.deep.equal({ pkName: '_id', tabName: 'Task' })
  })

})

describe('TableInfoByMessageType + schemas + TableAlias spec', () => {

  const mapToTable = new TableInfoByMessageType(schemaColl, tableAlias)

  it('should map `work(s)`(case-insensitive) to `File`', () => {
    [
      'work', 'Work', 'WorK',
      'works', 'Works', 'WorkS'
    ].forEach((msgType) => {
      expect(mapToTable.getTableInfo(msgType)).to.deep.equal({
        pkName: '_id', tabName: 'File'
      })
    })
  })

  it('should map `chatMessage(s)`(case-insensitive) to `Activity`', () => {
    [
      'chatMessage', 'chatmessage', 'ChatMessage',
      'chatMessages', 'chatmessages', 'ChatMessages'
    ].forEach((msgType) => {
      expect(mapToTable.getTableInfo(msgType)).to.deep.equal({
        pkName: '_id', tabName: 'Activity'
      })
    })
  })

  it('should map `activities`(case-insensitive) to `Activity`', () => {
    ['activities', 'Activities', 'ActivitiES'].forEach((msgType) => {
      expect(mapToTable.getTableInfo(msgType)).to.deep.equal({
        pkName: '_id', tabName: 'Activity'
      })
    })
  })

  it('should map `homeActivities`(case-insensitive) to `Activity`', () => {
    ['homeActivities', 'homeactivities', 'HomeActivities'].forEach((msgType) => {
      expect(mapToTable.getTableInfo(msgType)).to.deep.equal({
        pkName: '_id', tabName: 'Activity'
      })
    })
  })

  it('should map `taskflowstatus`(case-insensitive) to `TaskflowStatus`', () => {
    ['taskflowstatus', 'taskflowStatus'].forEach((msgType) => {
      expect(mapToTable.getTableInfo(msgType)).to.deep.equal({
        pkName: '_id', tabName: 'TaskflowStatus'
      })
    })
  })

})
