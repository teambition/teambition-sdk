'use strict'
import { Observable } from 'rxjs/Observable'
import { datasToSchemas, dataToSchema } from '../utils/index'
import BaseModel from './BaseModel'
import { PostData, default as Post } from '../schemas/Post'
import Collection from './BaseCollection'

export class PostModel extends BaseModel {
  private _schemaName = 'Post'

  addOne(post: PostData): Observable<PostData> {
    const result = dataToSchema<PostData>(post, Post)
    return this._save(result)
  }

  getOne(postId: string): Observable<PostData> {
    return this._get<PostData>(postId)
  }

  /**
   * _collections 索引为 `project:posts/${projectId}`
   */
  addPosts(projectId: string, posts: PostData[], page: number): Observable<PostData[]> {
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

  getPosts(projectId: string, page: number): Observable<PostData[]> {
    const collection = this._collections.get(`project:posts/${projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addMyPosts(userId: string, projectId: string, posts: PostData[], page: number): Observable<PostData[]> {
    const dbIndex = `project:my:posts/${projectId}`
    const result = datasToSchemas<PostData>(posts, Post)

    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(this._schemaName, (data: PostData) => {
        return data._projectId === projectId &&
          !data.isArchived &&
          data._creatorId === userId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getMyPosts(projectId: string, page: number): Observable<PostData[]> {
    const collection = this._collections.get(`project:my:posts/${projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new PostModel()
