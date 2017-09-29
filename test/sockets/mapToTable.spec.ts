import { describe, it } from 'tman'
import { expect } from 'chai'
import { TableInfoByMessageType } from '../../src/sockets/MapToTable'

describe('TableInfoByMessageType spec', () => {

  const mapToTable = new TableInfoByMessageType(
    [
      { name: 'Task', schema: { _id: { primaryKey: true } } },
      { name: 'Event', schema: { _id: { primaryKey: true } } },
      { name: 'Activity', schema: { _id: { primaryKey: true } } },
      { name: 'CustomFieldLink', schema: { _id: { primaryKey: true } } },
      { name: 'Alias', schema: { _id: { primaryKey: true } } }
    ] as any,
    {
      'Alias': 'Task'
    }
  )

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

})
