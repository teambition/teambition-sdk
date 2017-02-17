import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import { Database } from 'reactivedb'
import { MessageResult, eventParser } from './EventParser'
import { forEach, capitalizeFirstLetter } from '../utils/index'

const methodMap: any = {
  'change': 'update',
  'new': 'insert',
  'destroy': 'delete'
}

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
  let existTable = false
  // ensure table is defined
  try {
    db.get(arg1)
    existTable = true
  } catch (err) {
    console.warn(`Not existTable`)
  }
  if (existTable) {
    switch (socketMessage.method) {
      case 'new':
        return m.call(db, arg1, socketMessage.data)
      case 'change':
        return m.call(db, arg1, {
          where: { _id: socketMessage.id }
        }, socketMessage.data)
      case 'destroy':
        return m.call(db, arg1, {
          where: { _id: socketMessage.id }
        })
      default:
        return Observable.of(null)
    }
  } else {
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
