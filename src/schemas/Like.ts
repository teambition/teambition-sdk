'use strict'
import { Schema, ISchema, schemaName, bloodyParentWithProperty } from './schema'
import { ExecutorOrCreator } from '../teambition'

export interface LikeData extends ISchema {
  _id: string
  _boundToObjectId: string
  _boundToObjectType: string
  isLike: boolean
  likesCount: number
  likesGroup: ExecutorOrCreator[]
}

@schemaName('Like')
export default class LikeSchema extends Schema<LikeData> implements LikeData {
  _id: string = undefined
  @bloodyParentWithProperty('_boundToObjectType') _boundToObjectId: string = undefined
  _boundToObjectType: string = undefined
  isLike: boolean = undefined
  likesCount: number = undefined
  likesGroup: ExecutorOrCreator[] = undefined
}
