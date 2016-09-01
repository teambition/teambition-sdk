'use strict'
import { Observable } from 'rxjs/Observable'
import { clone, datasToSchemas, dataToSchema } from '../utils/index'
import BaseModel from './BaseModel'
import { MessageData, default as Message } from '../schemas/Message'
import Collection from './BaseCollection'

export class MessageModel extends BaseModel {
  private _schemaName = 'Message'

  addOne(message: MessageData): Observable<MessageData> {
    const result = dataToSchema<MessageData>(message, Message)
    return this._save(result)
  }

  addMessages(type: string, messages: MessageData[], page: number): Observable<MessageData[]> {
    const dbIndex = `messages:${type}`
    const result = datasToSchemas<MessageData>(messages, Message)

    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(this._schemaName, (data: MessageData) => {
        return type === 'normal' && data.isLater === false
        || type === 'later' && data.isLater === true
        || type === 'all'
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getMessages(type: string, page: number): Observable<MessageData[]> {
    const dbIndex = `messages:${type}`
    const collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  markAllAsRead(type: string): Observable<MessageData[]> {
    const dbIndex = `messages:${type}`
    const patch: MessageData[] = []
    const cache: Observable<MessageData[]> = this._collections.get(dbIndex).get()

    cache.forEach(messages => {
      messages.map(message => {
        message.isRead = true
        patch.push(clone(message))
      })
    })
    return this._updateCollection<Message>(dbIndex, patch)
  }

  deleteAllRead(type: string): Observable<MessageData[]> {
    const dbIndex = `messages:${type}`
    return this._updateCollection<Message>(dbIndex, [])
  }
}

export default new MessageModel()
