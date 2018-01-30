import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import { Database } from 'reactivedb'
import { Net } from '../Net'
import { eventParser } from './EventParser'
import { ParsedWSMsg, WSMsgHandler, WSMsgToDBHandler } from '../utils'
import { TableInfoByMessageType } from './MapToTable'
import { WSProxy } from './Middleware'

const methodMap: any = {
  'change': 'upsert',
  'new': 'upsert',
  'destroy': 'delete',
  'remove': 'delete'
}

export const createMsgHandler = (
  proxy: WSProxy = new WSProxy()
) => (
  msg: ParsedWSMsg
): Observable<any> => {
  proxy.apply(msg)
  return Observable.of(null)
}

/**
 * refresh 事件需要逐个单独处理
 * destroy 事件没有 data
 */
export const createMsgToDBHandler = (
  mapToTable: TableInfoByMessageType
) => (
  msg: ParsedWSMsg,
  db: Database
): Observable<any> => {
  const tabInfo = mapToTable.getTableInfo(msg.type)
  if (!tabInfo) {
    return Observable.of(null)
  }

  const { method, id, data } = msg
  const { tabName, pkName } = tabInfo

  const dbMethod = db[methodMap[method]]

  switch (method) {
    case 'new':
      return dbMethod.call(db, tabName, data)
    case 'change':
      return dbMethod.call(db, tabName,
        Array.isArray(data) ? data : { ...data, [pkName]: id }
      )
    case 'destroy':
      return dbMethod.call(db, tabName, {
        where: { [pkName]: id }
      })
    case 'remove':
      return dbMethod.call(db, tabName, {
        where: Array.isArray(data) ? { [pkName]: { $in: data } } : { [pkName]: data }
      })
    default:
      return Observable.of(null)
  }
}

export function socketHandler(
  net: Net,
  event: RequestEvent,
  handleMsgToDb: WSMsgToDBHandler,
  handleMsg: WSMsgHandler,
  mapToTable: TableInfoByMessageType,
  db?: Database
): Observable<any> {
  const parsedMsgs = eventParser(event)

  const signals = parsedMsgs.map((msg) => {
    const tabInfo = mapToTable.getTableInfo(msg.type)

    if (!tabInfo) { // todo: 判断 message method 是否有对应的 db 操作
      return handleMsg(msg)
    }

    if (!db) {
      net.bufferSocketPush(msg)
      return Observable.of(null)
    } else {
      return handleMsgToDb(msg, db)
    }
  })

  return Observable.from(signals)
    .mergeAll()
}
