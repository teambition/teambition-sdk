'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import TagSchema, { TagData } from '../schemas/Tag'
import { dataToSchema, datasToSchemas } from '../utils/index'
import TaskSchema from '../schemas/Task'
import PostSchema from '../schemas/Post'
import EventSchema from '../schemas/Event'
import FileSchema from '../schemas/File'
import EntrySchema from '../schemas/Entry'
import { ObjectSchema } from '../fetchs/TagFetch'
import { TagId, ProjectId, DetailObjectId, DetailObjectType } from '../teambition'

export class TagModel extends Model {
  private _schemaMap: any = {
    'task': {
      schema: TaskSchema,
      schemaName: 'Task'
    },
    'post': {
      schema: PostSchema,
      schemaName: 'Post'
    },
    'event': {
      schema: EventSchema,
      schemaName: 'Event'
    },
    'work': {
      schema: FileSchema,
      schemaName: 'File'
    },
    'entry': {
      schema: EntrySchema,
      schemaName: 'Entry'
    }
  }

  private _schemaName = 'Tag'

  addOne(tag: TagData): Observable<TagData> {
    const result = dataToSchema<TagData>(tag, TagSchema)
    return this._save(result)
  }

  getOne(_id: TagId): Observable<TagData> {
    return this._get<TagData>(<any>_id)
  }

  addByProjectId(projectId: ProjectId, tags: TagData[]): Observable<TagData[]> {
    const result = datasToSchemas<TagData>(tags, TagSchema)
    return this._saveCollection(`project:tags/${projectId}`, result, this._schemaName, (data: TagData) => {
      return data._projectId === projectId && !data.isArchived
    })
  }

  getByProjectId(projectId: ProjectId): Observable<TagData[]> {
    return this._get<TagData[]>(`project:tags/${projectId}`)
  }

  addRelated<T extends ObjectSchema>(_tagId: TagId, objectType: DetailObjectType, datas: T[]): Observable<T[]> {
    const DSchema = this._schemaMap[objectType]
    if (!DSchema || !DSchema.schema) {
      return Observable.throw(new Error('objectType is invalid'))
    }
    const result = datasToSchemas<any>(datas, DSchema.schema)
    return this._saveCollection(`tags:${objectType}/${_tagId}`, result, DSchema.schemaName, (data: T) => {
      return data.tagIds.indexOf(_tagId) !== -1 && !data.isArchived
    })
  }

  getRelated<T>(_tagId: TagId, objectType: DetailObjectType): Observable<T[]> {
    return this._get<T[]>(`tags:${objectType}/${_tagId}`)
  }

  relatedTag<T>(objectId: DetailObjectId, patch: T): Observable<T> {
    return this.update(<any>objectId, patch)
  }
}

export default new TagModel
