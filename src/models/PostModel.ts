'use strict'
import { Observable } from 'rxjs/Observable'
import { datasToSchemas, dataToSchema } from '../utils/index'
import BaseModel from './BaseModel'
import { PostData, default as Post } from '../schemas/Post'
import Collection from './BaseCollection'
import { PostId, TagId, ProjectId, UserId } from '../teambition'

export class PostModel extends BaseModel {
  private _schemaName = 'Post'

  addOne(post: PostData): Observable<PostData> {
    const result = dataToSchema<PostData>(post, Post)
    return this._save(result)
  }

  getOne(postId: PostId): Observable<PostData> {
    return this._get<PostData>(<any>postId)
  }

  /**
   * _collections 索引为 `project:posts/${projectId}`
   */
  addPosts(projectId: ProjectId, posts: PostData[], page: number): Observable<PostData[]> {
    const dbIndex = `project:posts/${projectId}`
    const result = datasToSchemas<PostData>(posts, Post)

    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(this._schemaName, (data: PostData) => {
        return data._projectId === projectId && !data.isArchived
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getPosts(projectId: ProjectId, page: number): Observable<PostData[]> {
    const collection = this._collections.get(`project:posts/${projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addMyPosts(userId: UserId, projectId: ProjectId, posts: PostData[], page: number): Observable<PostData[]> {
    const dbIndex = `project:my:posts/${projectId}`
    const result = datasToSchemas<PostData>(posts, Post)

    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(this._schemaName, (data: PostData) => {
        return data._projectId === projectId &&
          !data.isArchived &&
          (<any>data._creatorId) === userId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getMyPosts(projectId: ProjectId, page: number): Observable<PostData[]> {
    const collection = this._collections.get(`project:my:posts/${projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addByTagId(tagId: TagId, posts: PostData[], page: number): Observable<PostData[]> {
    const dbIndex = `tag:posts/${tagId}`
    const result = datasToSchemas(posts, Post)
    let collection = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: PostData) => {
        return !data.isArchived && data.tagIds && data.tagIds.indexOf(tagId) !== -1
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getByTagId(tagId: TagId, page: number): Observable<PostData[]> {
    const dbIndex = `tag:posts/${tagId}`
    let collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new PostModel
