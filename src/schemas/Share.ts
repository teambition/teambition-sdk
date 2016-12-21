import { Schema, schemaName, ISchema } from './schema'
import { ShareId, DetailObjectType, DetailObjectId, CommentMode } from '../teambition'
import { TaskData } from './Task'
import { PostData } from './Post'
import { FileData } from './File'
import { EventData } from './Event'
import { EntryData } from './Entry'

export interface ShareData extends ISchema {
  _id: ShareId
  _objectId: DetailObjectId
  objectType: DetailObjectType
  objectTitle: string
  limitAccess: boolean
  commentMode: CommentMode
  shareModel: TaskData | PostData | FileData | EventData | EntryData
}

@schemaName('Share')
export default class ShareSchema extends Schema<ShareData> implements ShareData {
  _id: ShareId = undefined
  _objectId: DetailObjectId = undefined
  objectType: DetailObjectType = undefined
  objectTitle: string = undefined
  limitAccess: boolean = undefined
  commentMode: CommentMode = undefined
  shareModel: TaskData | PostData | FileData | EventData | EntryData = undefined
}
