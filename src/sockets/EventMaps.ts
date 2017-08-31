import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import { Database } from 'reactivedb'
import { Net } from '../Net'
import { MessageResult, eventParser } from './EventParser'
import * as Interceptor from './SocketInterceptor'
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
  interceptors: Interceptor.Sequence
): Observable<any> => {
  const { method, id, data } = msg
  const dbMethod = db[methodMap[method]]

  const ret = interceptors.apply(msg, db, tableName, pkName)
  if ((ret & Interceptor.ControlFlow.IgnoreDefaultDBOps) === Interceptor.ControlFlow.IgnoreDefaultDBOps) {
    return Observable.of(null)
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
  socketInterceptors: Interceptor.Sequence,
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

  return handleMsgToDb(db, socketMessage, tableName, pkName, socketInterceptors)
}

export function socketHandler(
  net: Net,
  event: RequestEvent,
  socketInterceptors: Interceptor.Sequence,
  tabNameToPKName?: { [key: string]: string },
  db?: Database
): Observable<any> {
  const signals: Observable<any>[] = []
  const socketMessages = eventParser(event)
  forEach(socketMessages, socketMessage => {
    signals.push(handler(net, socketMessage, socketInterceptors, tabNameToPKName, db))
  })
  return Observable.from(signals)
    .mergeAll()
}
