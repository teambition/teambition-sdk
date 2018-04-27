'use strict'
import { Schema, schemaName, ISchema } from './schema'
import { TagCategoryId } from '../teambition'

export interface TagCategoryData extends ISchema {
  _id: TagCategoryId
  name: string
}

@schemaName('TagCategory')
export default class TagCategorySchema extends Schema<TagCategoryData> implements TagCategoryData {
  _id: TagCategoryId
  name: string
}
