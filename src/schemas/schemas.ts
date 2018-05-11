import { forEach, GeneralSchemaDef, SchemaColl, Dict } from '../utils'

const getPKNameinSchema = (schema: GeneralSchemaDef): string => {
  let pkName = ''

  const [next, stop] = [true, false]
  forEach(schema, (v, k) => {
    return (!v['primaryKey'] && next) || ((pkName = k) && stop)
  })

  return pkName
}

type SchemaCollectionValue = { pkName: string, schema: GeneralSchemaDef }

export class SchemaCollection {
  private dict: Dict<SchemaCollectionValue> = {}

  add(schemaInfo: { schema: GeneralSchemaDef, name: string }) {
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

  getSchemaPKName(tableName: string): string {
    return this.dict[tableName] ? this.dict[tableName].pkName : ''
  }

  listTableNames() {
    return Object.keys(this.dict)
  }
}

export const schemaColl = new SchemaCollection()
