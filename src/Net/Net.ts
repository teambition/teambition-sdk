import 'rxjs/add/observable/forkJoin'
import 'rxjs/add/operator/concatAll'
import 'rxjs/add/operator/do'
import { Observable } from 'rxjs/Observable'
import { QueryToken, SelectorMeta, ProxySelector, JoinMode } from 'reactivedb/proxy'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import {
  Database,
  SchemaDef,
  Query,
  Predicate,
  ExecutorResult
} from 'reactivedb'

import { forEach } from '../utils'
import Dirty from '../utils/Dirty'
import { SDKLogger } from '../utils/Logger'

export enum CacheStrategy {
  Request = 200,
  Cache
}

export interface ApiResult<T, U extends CacheStrategy> {
  request: Observable<T[]> | Observable<T>
  query: Query<T>
  tableName: string
  cacheValidate: U
  required?: (keyof T)[]
  assocFields?: AssocField<T>
  excludeFields?: string[]
  padding?: (missedId: string) => Observable<T>
}

export type AssocField<T> = {
  [P in keyof T]?: AssocField<T[P]> | string[]
}

export interface CApiResult<T> {
  request: Observable<T>
  tableName: string
  method: 'create'
}

export interface UDResult<T> {
  request: Observable<T>
  tableName: string
  method: 'update' | 'delete'
  clause: Predicate<T>
}

export type CUDApiResult<T> = CApiResult<T> | UDResult<T>

export type CUDBufferObject = {
  kind: 'CUD'
  tableName: string
  method: string
  value: any
}

export type SocketMessage = {
  id: string
  method: string
  data: any
}

export type SocketCUDBufferObject = {
  kind: 'SocketCUD'
  arg: string
  socketMessage: SocketMessage
  pkName: string
  type: any
}

export type SelectorBufferObject = {
  kind: 'Selector'
  realSelectorInfo: ApiResult<any, CacheStrategy>
  proxySelector: BehaviorSubject<SelectorMeta<any>>
}

export type BufferObject = CUDBufferObject | SocketCUDBufferObject | SelectorBufferObject

export class Net {

  public fields = new Map<string, string[]>()
  public database: Database | undefined
  private requestMap = new Map<string, boolean>()
  private primaryKeys = new Map<string, string>()
  private persistedDataBuffer: BufferObject[] = []
  private requestResultLength = new Map<string, number>()

  private validate = <T>(result: ApiResult<T, CacheStrategy>) => {
    const fn = (stream$: Observable<T[]>) => stream$
      .switchMap(data => {
        if (!data.length) {
          return Observable.of(data)
        }
        return Observable.forkJoin(
          Observable.from(data)
            .mergeMap(v => {
              if (
                result.required &&
                result.required.some(k => typeof v[k] === 'undefined') &&
                typeof result.padding === 'function'
              ) {
                return result.padding(v[this.primaryKeys.get(result.tableName)!])
                  .concatMap(r => this.database!
                    .upsert(result.tableName, r)
                    .mapTo(r)
                  )
                  .do(r => Object.assign(v, r))
              }
              return Observable.of(v)
            })
          )
          .mapTo(data)
      })
    fn.toString = () => 'SDK_VALIDATE'
    return fn
  }

  constructor(
    schemas: { schema: SchemaDef<any>, name: string }[]
  ) {
    forEach(schemas, d => {
      this.fields.set(d.name, Object.keys(d.schema).filter(k => !d.schema[k].virtual))
      forEach(d.schema, (val, key) => {
        if (val.primaryKey) {
          this.primaryKeys.set(d.name, key)
          return false
        }
        return true
      })
    })
  }

  lift<T>(result: ApiResult<T, CacheStrategy.Cache>): QueryToken<T>

  lift<T>(result: ApiResult<T, CacheStrategy.Request>): QueryToken<T>

  lift<T>(result: CUDApiResult<T>): Observable<T>

  lift<T>(result: ApiResult<T, CacheStrategy> | CUDApiResult<T>) {
    if ((result as ApiResult<T, CacheStrategy>).cacheValidate) {
      return this.handleApiResult<T>(result as ApiResult<T, CacheStrategy>)
    } else {
      return this.handleCUDAResult<T>(result as CUDApiResult<T>)
    }
  }

  handleApiResult<T>(result: ApiResult<T, CacheStrategy>): QueryToken<T> | Observable<T> | Observable<T[]> {
    const database = this.database
    if (!database) {
      return this.bufferResponse(result)
    }

    return this.handleRequestCache(result)
  }

  handleCUDAResult<T>(result: CUDApiResult<T>) {
    if (!this.database) {
      return this.bufferCUDResponse(result)
    }

    const database = this.database!

    const { request, method, tableName } = result as CUDApiResult<T>
    let destination: Observable<ExecutorResult> | Observable<T | T[]>
    return request
      .concatMap(v => {
        switch (method) {
          case 'create':
            destination = database.upsert<T>(tableName, v)
            break
          case 'update':
            destination = database.upsert(tableName, v)
            break
          case 'delete':
            destination = database.delete<T>(tableName, (result as UDResult<T>).clause)
            break
          default:
            throw new Error()
        }
        return destination.mapTo<ExecutorResult | T | T[], T>(v)
      })
  }

  persist(database: Database) {
    if (!this.database) {
      this.database = database
    }
    const asyncQueue: Observable<any>[] = []
    forEach(this.persistedDataBuffer, (v: BufferObject) => {
      if (v.kind === 'CUD') {
        const p = database[(v as CUDBufferObject).method](v.tableName, v.value)
        asyncQueue.push(p)
      } else if (v.kind === 'SocketCUD') {
        const socketMessage = v.socketMessage
        const type = v.type
        const arg = v.arg
        const pkName = v.pkName
        if (socketMessage.method === 'destroy' || socketMessage.method === 'remove') {
          const p = database.delete(arg, {
            where: { [pkName]: socketMessage.id || socketMessage.data }
          })
          asyncQueue.push(p)
        } else if (socketMessage.method === 'new') {
          const p = database.upsert(arg, socketMessage.data)
          asyncQueue.push(p)
        } else if (socketMessage.method === 'change') {
          const dirtyStream = Dirty.handlerSocketMessage(socketMessage.id, type, socketMessage.data, database)
          if (dirtyStream !== null) {
            const p = dirtyStream
            asyncQueue.push(p)
          } else {
            const p = database.upsert(arg, {
              ...socketMessage.data,
              [pkName]: socketMessage.id
            })
            asyncQueue.push(p)
          }
        }
      } else if (v.kind === 'Selector') {
        const cacheControl$ = v.proxySelector
        const token = this.handleRequestCache(v.realSelectorInfo)
        const selector$ = token.selector$
        asyncQueue.push(
          selector$.do({
            next(selector) {
              cacheControl$.next(selector)
            }
          })
        )
      }
    })

    this.persistedDataBuffer.length = 0

    return Observable.from(asyncQueue)
      .concatAll()
      .do({
        error: async (err: Observable<Error>) => {
          const errObj = await err.toPromise()
          SDKLogger.error(errObj.message)
        }
      })
  }

  bufferResponse<T>(result: ApiResult<T, CacheStrategy>) {

    const { request, q, tableName } = this.getInfoFromResult(result)
    const proxySelector = new ProxySelector<T>(request, q, tableName)
    const cacheControl$: BehaviorSubject<SelectorMeta<T>> = new BehaviorSubject(proxySelector)

    this.persistedDataBuffer.push({
      kind: 'Selector',
      realSelectorInfo: result,
      proxySelector: cacheControl$
    })

    return new QueryToken(cacheControl$)
      .map(this.validate(result))
  }

  bufferCUDResponse<T>(result: CUDApiResult<T>) {
    const { request, method, tableName } = result as CUDApiResult<T>
    return request.do((v: T | T[]) => {
      this.persistedDataBuffer.push({
        kind: 'CUD',
        tableName,
        method: ((method === 'create' || method === 'update') ? 'upsert' : method),
        value: method === 'delete' ? (result as UDResult<T>).clause : v
      })
    })
  }

  bufferSocketPush(
    arg: string,
    socketMessage: SocketMessage,
    pkName: string,
    type: any
  ) {
    this.persistedDataBuffer.push({
      kind: 'SocketCUD',
      arg,
      socketMessage,
      pkName,
      type
    })
    return Observable.of(null)
  }

  private handleRequestCache<T>(result: ApiResult<T, CacheStrategy>) {
    const database = this.database!
    const {
      request,
      q,
      cacheValidate,
      tableName
    } = this.getInfoFromResult(result)

    const sq = JSON.stringify(q)
    const requestCache = this.requestMap.get(sq)
    let token: QueryToken<T>
    switch (cacheValidate) {
      case CacheStrategy.Request:
        if (!requestCache) {
          const selector$ = request
            .do<T | T[]>(r => {
              if (Array.isArray(r)) {
                this.requestResultLength.set(sq, r.length)
              }
            })
            .concatMap(v => database
              .upsert(tableName, v)
              .mapTo(Array.isArray(v) ? v : [v])
            )
            .do(() => this.requestMap.set(sq, true))
            .concatMap(() => database.get(tableName, q, JoinMode.explicit).selector$)
          token = new QueryToken(selector$).map(this.validate(result))
          break
        } else {
          token = database.get<T>(tableName, q, JoinMode.explicit)
            .map(this.validate(result))
          break
        }
      case CacheStrategy.Cache:
        const selector$ = request
          .concatMap((r: T | T[]) => database.upsert(tableName, r))
          .concatMap(() => database.get(tableName, q, JoinMode.explicit).selector$)
        return new QueryToken(selector$)
      default:
        throw new TypeError('unreachable code path')
    }
    return token
  }

  private getInfoFromResult<T>(result: ApiResult<T, CacheStrategy>) {
    const {
      query,
      tableName,
      cacheValidate,
      request,
      assocFields,
      excludeFields
    } = result as ApiResult<T, CacheStrategy>
    const preDefinedFields = this.fields.get(tableName)
    if (!preDefinedFields) {
      throw new TypeError(`table: ${tableName} is not defined`)
    }
    const fields: string[] = []
    if (assocFields) {
      fields.push(assocFields as any)
    }
    const set = new Set(excludeFields)
    forEach(this.fields.get(tableName), f => {
      if (!set.has(f)) {
        fields.push(f)
      }
    })
    const q: Query<T> = { ...query, fields }
    return { request, q, cacheValidate, tableName }
  }

}
