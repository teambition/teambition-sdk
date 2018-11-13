import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import { Database } from 'reactivedb'
import { Net } from '../Net'
import { eventParser } from './EventParser'
import { ParsedWSMsg, WSMsgHandler, WSMsgToDBHandler } from '../utils'
import { TableInfoByMessageType } from './MapToTable'
import { Proxy } from './Middleware'
import { WorkerClient } from '../worker/WorkerClient'

const methodMap: any = {
  'change': 'upsert',
  'new': 'upsert',
  'destroy': 'delete',
  'remove': 'delete'
}

export const createMsgHandler = (
  proxy: Proxy = new Proxy()
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
  rdbWorker: WorkerClient
): Observable<any> => {
  const tabInfo = mapToTable.getTableInfo(msg.type)
  if (!tabInfo) {
    return Observable.of(null)
  }

  const { method, id, data } = msg
  const { tabName, pkName } = tabInfo

  const dbMethod = methodMap[method]

  switch (method) {
    case 'new':
      return rdbWorker.postMessage(dbMethod, [tabName, data])
    case 'change':
      return rdbWorker.postMessage(dbMethod, [
        tabName,
        Array.isArray(data) ? data : { ...data, [pkName]: id },
      ])
    case 'destroy':
      return rdbWorker.postMessage(dbMethod, [
        tabName,
        { where: { [pkName]: id } },
      ])
    case 'remove':
      return rdbWorker.postMessage(dbMethod, [
        tabName,
        {
          where: Array.isArray(data) ? { [pkName]: { $in: data } } : { [pkName]: data }
        }
      ])
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
  worker?: WorkerClient
): Observable<any> {
  const parsedMsgs = eventParser(event)

  const signals = parsedMsgs.map((msg) => {
    const tabInfo = mapToTable.getTableInfo(msg.type)

    const proxyTask$ = handleMsg(msg)

    if (!tabInfo) {
      return proxyTask$
    }

    let interceptorsTask$: Observable<any>
    if (!worker) {
      net.bufferSocketPush(msg)
      interceptorsTask$ = Observable.of(null)
    } else {
      interceptorsTask$ = handleMsgToDb(msg, worker)
    }

    return Observable.merge(interceptorsTask$, proxyTask$)
  })

  return Observable.from(signals)
    .mergeAll()
}
