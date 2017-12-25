import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import { Database } from 'reactivedb'
import { Net } from '../Net'
import { eventParser } from './EventParser'
import { WSMessageParsed } from '../utils'
import Dirty from '../utils/Dirty'
import { TableInfoByMessageType } from './MapToTable'

const methodMap: any = {
  'change': 'upsert',
  'new': 'upsert',
  'destroy': 'delete',
  'remove': 'delete'
}

/**
 * refresh 事件需要逐个单独处理
 * destroy 事件没有 data
 */
export const handleMsgToDb = (
  msg: WSMessageParsed,
  db: Database,
  tableName: string,
  pkName: string
): Observable<any> => {

  const { method, id, data } = msg

  if (method === 'new' || method === 'change') {
    const dirtyStream = Dirty.handleSocketMessage(msg, db)
    if (dirtyStream) {
      return dirtyStream
    }
  }

  const dbMethod = db[methodMap[method]]

  switch (method) {
    case 'new':
      return dbMethod.call(db, tableName, data)
    case 'change':
      return dbMethod.call(db, tableName,
        Array.isArray(data) ? data : { ...data, [pkName]: id }
      )
    case 'destroy':
      return dbMethod.call(db, tableName, {
        where: { [pkName]: id }
      })
    case 'remove':
      return dbMethod.call(db, tableName, {
        where: Array.isArray(data) ? { [pkName]: { $in: data } } : { [pkName]: data }
      })
    default:
      return Observable.of(null)
  }
}

export function socketHandler(
  net: Net,
  event: RequestEvent,
  mapToTable: TableInfoByMessageType,
  db?: Database
): Observable<any> {
  const parsedMsgs = eventParser(event)

  const signals = parsedMsgs.map((msg) => {
    const tabInfo = mapToTable.getTableInfo(msg.type)

    if (!tabInfo) {
      return Observable.of(null)
    }

    const { tabName, pkName } = tabInfo

    if (!db) {
      net.bufferSocketPush(msg, tabName, pkName)
      return Observable.of(null)
    } else {
      return handleMsgToDb(msg, db, tabName, pkName)
    }
  })

  return Observable.from(signals)
    .mergeAll()
}
