import { describe, it } from 'tman'
import { expect } from 'chai'
import { schemas } from '../../src/SDK'
import { SchemaColl, clone } from '../index'

import tableAlias from '../../src/sockets/TableAlias'

describe('TableAlias spec', () => {

  const schemasClone: SchemaColl = clone(schemas)

  it('should map to existing tables', () => {
    const existingTableNames = schemasClone.map(({ name }) => name)
    const tableNamesByAlias = Object.keys(tableAlias).map((k) => tableAlias[k])

    tableNamesByAlias.forEach((name) => {
      expect(name).to.be.oneOf(existingTableNames)
    })
  })

})
