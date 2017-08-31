import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import { Database } from 'reactivedb'
import { Net } from '../Net'
import { MessageResult, eventParser } from './EventParser'
import { SocketInterceptor } from './SocketInterceptor'
import { forEach, capitalizeFirstLetter } from '../utils'
import { SDKLogger } from '../utils/Logger'

const methodMap: any = {
  'change': 'upsert',
  'new': 'upsert',
  'destroy': 'delete',
  'remove': 'delete'
}

const tableAlias = {
  Work: 'File',
  ChatMessage: 'Activity',
  Activities: 'Activity',
  HomeActivities: 'Activity'
}

export const handleMsgToDb = (
  db: Database,
  msg: MessageResult,
  tableName: string,
  pkName: string,
  socketInterceptor: SocketInterceptor
) => {
  const { method, id, data } = msg
  const dbMethod = db[methodMap[method]]

  // interceptor 有比默认操作更高的优先级；
  // 并且一旦其 do 方法返回真值，目前代表所需操作已经完成，不再需要默认操作。
  // 这样做的好处是，以最直接的方式给予 interceptor 最大的控制权；
  // 有问题的地方在于，一方面，可能逐渐令默认操作成为“死”代码，并且令默认操作失去
  // 对 db 操作的控制。令一部分也许可以得到广泛重用的代码失去其被重用的机会。
  // _An ALL OR NOTHING design.
  const ret = socketInterceptor.do(method, tableName, id, data, db)
  if (ret) {
    return ret
  }

  switch (method) {
    case 'new':
      return dbMethod.call(db, tableName, data)
    case 'change':
      return dbMethod.call(db, tableName, {
        ...data,
        [pkName]: id
      })
    case 'destroy':
      return dbMethod.call(db, tableName, {
        where: { [pkName]: id }
      })
    case 'remove':
      return dbMethod.call(db, tableName, {
        where: { [pkName]: data }
      })
    default:
      return Observable.of(null)
  }
}

/**
 * refresh 事件需要逐个单独处理
 * destroy 事件没有 data
 */
const handler = (
  net: Net,
  socketMessage: MessageResult,
  socketInterceptor: SocketInterceptor,
  tabNameToPKName: { [key: string]: string } = {},
  db?: Database
) => {
  let type = socketMessage.type
  if (type.charAt(type.length - 1) === 's' &&
    type !== 'activities' &&
    type !== 'homeActivities') {
    type = type.substring(0, type.length - 1)
  }
  const arg1 = capitalizeFirstLetter(type)

  if (!arg1) {
    return Observable.of(null)
  }

  const tableName = tableAlias[arg1] || arg1
  const pkName = tabNameToPKName[tableName]

  if (!pkName) {
    SDKLogger.warn(`Non-existent table: ${tableName}`)
    return Observable.of(null)
  }

  if (!db) {
    net.bufferSocketPush(tableName, socketMessage, pkName)
    return Observable.of(null)
  }

  return handleMsgToDb(db, socketMessage, tableName, pkName, socketInterceptor)
}

export function socketHandler(
  net: Net,
  event: RequestEvent,
  socketInterceptor: SocketInterceptor,
  tabNameToPKName?: { [key: string]: string },
  db?: Database
): Observable<any> {
  const signals: Observable<any>[] = []
  const socketMessages = eventParser(event)
  forEach(socketMessages, socketMessage => {
    signals.push(handler(net, socketMessage, socketInterceptor, tabNameToPKName, db))
  })
  return Observable.from(signals)
    .mergeAll()
}
