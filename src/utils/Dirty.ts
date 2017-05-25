/**
 * 这里的代码用来处理坏掉的后端 API
 * 做一些很脏的事情
 */
import { Observable } from 'rxjs/Observable'
import { Database, ExecutorResult, SchemaDef } from 'reactivedb'
import { TaskSchema } from '../schemas/Task'
import { LikeSchema } from '../schemas/Like'
import { MessageSchema } from '../schemas/Message'
import { forEach } from './index'

export class Dirty {

  /**
   * 处理任务列表中坏掉的 subtaskCount 字段
   */
  handleMytasksApi (tasks: TaskSchema[]): TaskSchema[] {
    forEach(tasks, task => {
      delete task.subtaskCount
    })
    return tasks
  }

  handleSocketMessage(id: string, type: string, data: any, db: Database): Observable<any> | null {
    const methods = [ '_handleLikeMessage', '_handleTaskUpdateFromSocket', '_handleMessage']
    let signal: Observable<any> | null = null
    forEach(methods, method => {
      const result = this[method](id, type, data, db)
      if (result) {
        signal = result
        return false
      }
      return null
    })
    return signal
  }

  _isUpdateMessageReadSocket(data: MessageSchema) {
    if (Object.keys(data).length === 5
      && data.isRead === true
      && data.unreadActivitiesCount === 0
      && data.isAted !== undefined
      && data.updated !== undefined
      && (data as any).msgType === 'pm') {
        return true
      }
      return false
  }
  /**
   * 后端通知和消息存的是同一个模型，只是objectType不同 (通知的objectType是'activity')
   * 所以前端如果要把这两个东西存成两个模型的话，需要在socket区分
   * 这里在重构chat的时候，直接过滤掉通知消息，当重构通知的时候，需要改动这里代码，把通知消息
   * 存在自己的表里
   */
  _handleMessage(_: string, __: string, data: MessageSchema, ___: Database): Observable<any> | null {
    if (data.objectType && data.objectType !== 'room') {
      // return db.upsert('ActivityMessage | PostMessage | ...', data)
      return Observable.of(null)
    }
    if (data as any === 'readAll:private') {
      return Observable.of(null)
    }
    if (this._isUpdateMessageReadSocket(data)) {
      delete data.updated
    }
    return null
  }

  /**
   * 处理 socket 推送点赞数据变动的场景下
   * 后端认为这种数据应该被 patch 到它的实体上
   * 而前端需要将点赞数据分开存储
   */
  _handleLikeMessage(id: string, type: string, data: LikeSchema | any, database: Database): Observable<ExecutorResult> | null {
    if (data.likesGroup && data.likesGroup instanceof Array) {
      data._boundToObjectId = id
      data._boundToObjectType = type
      data._id = `${id}:like`
      return database.upsert('Like', data)
    }
    return null
  }

  _handleTaskUpdateFromSocket(_id: string, _type: string, data: any): void {
    if (data &&
        !data._executorId &&
        typeof data.executor !== 'undefined') {
      delete data.executor
    }
  }

  getPKNameinSchema(schema: SchemaDef<any>): string {
    let pkName = ''

    const [next, stop] = [true, false]
    forEach(schema, (v, k) => {
      return (!v.primaryKey && next) || ((pkName = k) && stop)
    })

    return pkName
  }

  prefixWithColonIfItIsMissing(eventStr: string) {
    if (!eventStr.length) {
      return ':'
    }
    if (eventStr.charAt(0) !== ':') {
      return ':' + eventStr
    }
    return eventStr
  }
}

export default new Dirty
