import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import { Database } from 'reactivedb'
import { Net } from '../Net'
import { MessageResult, eventParser } from './EventParser'
import { forEach, capitalizeFirstLetter } from '../utils/index'
import { Logger, Level } from 'reactivedb/shared'
import Dirty from '../utils/Dirty'

const methodMap: any = {
  'change': 'upsert',
  'new': 'upsert',
  'destroy': 'delete',
  'remove': 'delete'
}

const envify = () => {
  const env = (process && process.env && process.env.NODE_ENV) || 'production'
  switch (env) {
    case 'production':
      return Level.error
    case 'development':
      return Level.debug
    default:
      return Level.error
  }
}

const SDKLogger = Logger.get('teambition-sdk', (name, _, message) => {
  return `${name}: at ${new Date().toLocaleString()} \r\n    ` + message
})

SDKLogger.setLevel(envify())

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
  const method = socketMessage.method
  let type = socketMessage.type
  if (type.charAt(type.length - 1) === 's' &&
    type !== 'activities' &&
    type !== 'homeActivities') {
    type = type.substring(0, type.length - 1)
  }
  const arg1 = capitalizeFirstLetter(type)
  const pkName = tabNameToPKName[arg1]

  if (!db) {
    net.bufferSocketPush(arg1, socketMessage, pkName, type)
    return Observable.of(null)
  }

  if (!pkName) {
    SDKLogger.warn(`Non-existent table: ${arg1}`)
    return Observable.of(null)
  }

  const m = db[methodMap[method]]
  switch (socketMessage.method) {
    case 'new':
      return m.call(db, arg1, socketMessage.data)
    case 'change':
      const dirtyStream = Dirty.handlerSocketMessage(socketMessage.id, type, socketMessage.data, db)
      if (dirtyStream) {
        return dirtyStream
      }
      return m.call(db, arg1, {
        ...socketMessage.data,
        [pkName]: socketMessage.id
      })
    case 'destroy':
    case 'remove':
      return m.call(db, arg1, {
        where: { [pkName]: socketMessage.id || socketMessage.data }
      })
    default:
      return Observable.of(null)
  }
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
