'use strict'
import { Observable } from 'rxjs'
import { datasToSchemas, dataToSchema } from '../utils/index'
import BaseModel from './BaseModel'
import Post from '../schemas/Post'
import Collection from './BaseCollection'

export class PostModel extends BaseModel {
  private _schemaName = 'Post'
  private _collections = new Map<string, Collection<Post>>()

  destructor() {
    this._collections.clear()
  }

  addOne(post: Post): Observable<Post> {
    const result = dataToSchema<Post>(post, Post)
    return this._save(result)
  }

  getOne(postId: string): Observable<Post> {
    return this._get<Post>(postId)
  }

  /**
   * _collections 索引为 `project:posts/${projectId}`
   */
  addPosts(projectId: string, posts: Post[], page: number): Observable<Post[]> {
    const dbIndex = `project:posts/${projectId}`
    const result = datasToSchemas<Post>(posts, Post)

    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(this._schemaName, (data: Post) => {
        return data._projectId === projectId && !data.isArchived
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getPosts(projectId: string, page: number): Observable<Post[]> {
    const collection = this._collections.get(`project:posts/${projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new PostModel()
