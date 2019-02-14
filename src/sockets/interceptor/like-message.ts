import 'rxjs/add/observable/forkJoin'
import { Observable } from 'rxjs/Observable'
import { ExecutorResult } from 'reactivedb/interface'
import { MsgToDBHandler } from '../Middleware'
import { mapMsgTypeToTable } from '../MapToTable'

/**
 * 处理 socket 推送点赞数据变动的场景下
 * 后端认为这种数据应该被 patch 到它的实体上
 * 而前端需要将点赞数据分开存储
 */
export const redirectLike: MsgToDBHandler = (msg, db) => {
  const { method, id, type, data } = msg

  if (
    (method !== 'new' && method !== 'change') ||
    !data ||
    !data.likesGroup ||
    !Array.isArray(data.likesGroup)
  ) {
    return
  }

  const ops: Observable<ExecutorResult>[] = []

  const like = mapMsgTypeToTable.getTableInfo('like')
  ops.push(db.upsert(like!.tabName, { ...data, [like!.pkName]: `${id}:like` }))

  const tabInfo = mapMsgTypeToTable.getTableInfo(type)
  if (tabInfo && tabInfo.tabName === 'Task') {
    const task = tabInfo
    ops.push(db.upsert(task.tabName, { ...data, [task.pkName]: id }))
  }

  return Observable.forkJoin(ops)
}
