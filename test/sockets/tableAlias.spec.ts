import { describe, it } from 'tman'
import { expect } from 'chai'
import { schemaColl } from '../../src/SDK'

import tableAlias from '../../src/sockets/TableAlias'

describe('TableAlias spec', () => {

  it('should map to existing tables', () => {
    const existingTableNames = schemaColl.listTableNames()
    const tableNamesByAlias = Object.keys(tableAlias).map((k) => tableAlias[k])

    tableNamesByAlias.forEach((name) => {
      expect(name).to.be.oneOf(existingTableNames)
    })
  })

})
