'use strict'
import { Schema, ISchema, schemaName, bloodyParentWithProperty } from './schema'
import { ExecutorOrCreator, DetailObjectType, DetailObjectId } from '../teambition'

export interface LikeData extends ISchema {
  _id: string
  _boundToObjectId: DetailObjectId
  _boundToObjectType: DetailObjectType
  likesGroup: ExecutorOrCreator[]
}

@schemaName('Like')
export default class LikeSchema extends Schema<LikeData> implements LikeData {
  _id: string = undefined
  @bloodyParentWithProperty('_boundToObjectType') _boundToObjectId: DetailObjectId = undefined
  _boundToObjectType: DetailObjectType = undefined
  likesGroup: ExecutorOrCreator[] = undefined
}
