import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import { Database } from 'reactivedb'
import { Net } from '../Net'
import { MessageResult, eventParser } from './EventParser'
import { forEach, capitalizeFirstLetter } from '../utils'
import { SDKLogger } from '../utils/Logger'
import Dirty from '../utils/Dirty'

const methodMap: any = {
  'change': 'upsert',
  'new': 'upsert',
  'destroy': 'delete',
  'remove': 'delete'
}

const tableAlias = {
  Work: 'File',
  ChatMessage: 'Activity'
}

export const handleMsgToDb = (db: Database, msg: MessageResult, tableName: string, pkName: string) => {
  const m = db[methodMap[msg.method]]
  let dirtyStream: Observable<any> | null

  switch (msg.method) {
    case 'new':
      dirtyStream = Dirty.handleSocketMessage(msg.id, tableName, msg.data, db)
      if (dirtyStream) {
        return dirtyStream
      }
      return m.call(db, tableName, msg.data)
    case 'change':
      dirtyStream = Dirty.handleSocketMessage(msg.id, tableName, msg.data, db)
      if (dirtyStream) {
        return dirtyStream
      }
      return m.call(db, tableName, {
        ...msg.data,
        [pkName]: msg.id
      })
    case 'destroy':
    case 'remove':
      return m.call(db, tableName, {
        where: { [pkName]: msg.id || msg.data }
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
    net.bufferSocketPush(tableName, socketMessage, pkName, type)
    return Observable.of(null)
  }

  return handleMsgToDb(db, socketMessage, tableName, pkName)
}

export function socketHandler(
  net: Net,
  event: RequestEvent,
  tabNameToPKName?: { [key: string]: string },
  db?: Database
): Observable<any> {
  const signals: Observable<any>[] = []
  const socketMessages = eventParser(event)
  forEach(socketMessages, socketMessage => {
    signals.push(handler(net, socketMessage, tabNameToPKName, db))
  })
  return Observable.from(signals)
    .mergeAll()
}
