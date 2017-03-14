import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import { Database } from 'reactivedb'
import { MessageResult, eventParser } from './EventParser'
import { forEach, capitalizeFirstLetter } from '../utils/index'
import { Logger, Level } from 'reactivedb'
import Dirty from '../utils/Dirty'

const methodMap: any = {
  'change': 'update',
  'new': 'insert',
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
const handler = (db: Database, socketMessage: MessageResult) => {
  const method = socketMessage.method
  let type = socketMessage.type
  if (type.charAt(type.length - 1) === 's' &&
      type !== 'activities' &&
      type !== 'homeActivities') {
    type = type.substring(0, type.length - 1)
  }
  const m = db[methodMap[method]]
  const arg1 = capitalizeFirstLetter(type)

  try {
    // ensure table is defined
    db.get(arg1)
  } catch (err) {
    SDKLogger.warn(`Not existTable: ${arg1}`)
    return Observable.of(null)
  }

  switch (socketMessage.method) {
    case 'new':
      return m.call(db, arg1, socketMessage.data)
    case 'change':
      const dirtyStream = Dirty.handlerSocketMessage(socketMessage.id, type, socketMessage.data, db)
      if (dirtyStream) {
        return dirtyStream
      }
      return m.call(db, arg1, {
        where: { _id: socketMessage.id }
      }, socketMessage.data)
    case 'destroy':
    case 'remove':
      return m.call(db, arg1, {
        where: { _id: socketMessage.id || socketMessage.data }
      })
    default:
      return Observable.of(null)
  }
}

export function socketHandler (db: Database, event: RequestEvent): Observable<any> {
  const signals: Observable<any>[] = []
  const socketMessages = eventParser(event)
  forEach(socketMessages, socketMessage => {
    signals.push(handler(db, socketMessage))
  })
  return Observable.from(signals)
    .mergeAll()
}
