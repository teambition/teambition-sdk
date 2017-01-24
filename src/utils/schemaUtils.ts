import { setSchema, Schema } from '../schemas/schema'
import { forEach } from './helper'

export const dataToSchema = <T> (data: T, SchemaClass: any, unionFlag = '_id'): T & Schema<T> => {
  if (!data) {
    return null
  }
  const result = setSchema(new SchemaClass(), data)
  result.$$unionFlag = unionFlag
  result.setBloodyParent()
  return result
}

export const datasToSchemas = <U>(datas: U[], SchemaClass: any, unionFlag = '_id'): (Schema<U> & U)[] => {
  if (!datas) {
    return null
  }
  const result = new Array<(Schema<U> & U)>()
  forEach(datas, data => {
    const schema = setSchema(new SchemaClass(), data)
    schema.$$unionFlag = unionFlag
    schema.setBloodyParent()
    result.push(schema)
  })
  return result
}
