import { SchemaDef } from 'reactivedb'
import { forEach, SchemaColl, Dict } from '../utils'

const getPKNameinSchema = (schema: SchemaDef<any>): string => {
  let pkName = ''

  const [next, stop] = [true, false]
  forEach(schema, (v, k) => {
    return (!v.primaryKey && next) || ((pkName = k) && stop)
  })

  return pkName
}

type SchemaCollectionValue = { pkName: string, schema: SchemaDef<any> }

export class SchemaCollection {
  private dict: Dict<SchemaCollectionValue> = {}

  add(schemaInfo: { schema: SchemaDef<any>, name: string }) {
    this.dict[schemaInfo.name] = {
      schema: schemaInfo.schema,
      pkName: getPKNameinSchema(schemaInfo.schema)
    }
  }

  toArray(): SchemaColl {
    const schemas: SchemaColl = []
    forEach(this.dict, (val, key) => {
      schemas.push({ ...val, name: key })
    })
    return schemas
  }

  getSchema(tableName: string) {
    return this.dict[tableName]
  }

  listTableNames() {
    return Object.keys(this.dict)
  }
}

export const schemaColl = new SchemaCollection()
