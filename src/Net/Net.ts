import 'rxjs/add/observable/forkJoin'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/concatAll'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/mapTo'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/filter'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { QueryToken, SelectorMeta, ProxySelector } from 'reactivedb/proxy'
import {
  Database,
  SchemaDef,
  Query,
  Predicate,
  ExecutorResult,
  JoinMode
 } from 'reactivedb'

import { forEach, ParsedWSMsg, WSMsgToDBHandler } from '../utils'
import { SDKLogger } from '../utils/Logger'
export enum CacheStrategy {
  Request = 200,
  Cache
}

export interface ApiResult<T, U extends CacheStrategy> {
  request: Observable<T> | Observable<T[]>
  query: Query<T>
  tableName: string
  cacheValidate: U
  required?: (keyof T)[]
  assocFields?: AssocField<T>
  excludeFields?: string[]
  padding?: (missedId: string) => Observable<T | null>
}

export type AssocField<T> = { [P in keyof T]?: AssocField<T[P]> | string[] }

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

export type SocketCUDBufferObject = {
  kind: 'SocketCUD'
  socketMessage: ParsedWSMsg
}

export type SelectorBufferObject = {
  kind: 'Selector'
  realSelectorInfo: ApiResult<any, CacheStrategy>
  proxySelector: BehaviorSubject<SelectorMeta<any>>
}

export type BufferObject = CUDBufferObject | SocketCUDBufferObject | SelectorBufferObject

const dbGetWithSelfJoinEnabled =
  <T>(db: Database, table: string, query: Query<T>): QueryToken<T> => {
    return db.get(table, query, JoinMode.explicit)
  }

export class Net {
  public fields = new Map<string, string[]>()
  public database: Database | undefined
  private requestMap = new Map<string, boolean>()
  private primaryKeys = new Map<string, string>()
  public persistedDataBuffer: BufferObject[] = []
  private msgToDB: WSMsgToDBHandler

  private validate = <T>(result: ApiResult<T, CacheStrategy>) => {
    const { tableName, required, padding } = result

    const hasRequiredFields = Array.isArray(required)
    const hasPaddingFunction = typeof padding === 'function'
    const pk = this.primaryKeys.get(tableName)

    const fn = (stream$: Observable<T[]>) =>
      stream$.switchMap(data => !data.length
        ? Observable.of(data)
        : Observable.forkJoin(
          Observable.from(data)
            .mergeMap(datum => {
              if (!hasRequiredFields || !hasPaddingFunction || !pk ||
                required!.every(k => typeof datum[k] !== 'undefined')
              ) {
                return Observable.of(datum)
              }
              const patch = padding!(datum[pk]).filter(r => r != null) as Observable<T>
              return patch
                .concatMap(r => this.database!.upsert(tableName, r).mapTo(r))
                .do(r => Object.assign(datum, r))
            })
        )
          .mapTo(data)
      )
    fn.toString = () => 'SDK_VALIDATE'
    return fn
  }

  constructor(schemas: { schema: SchemaDef<any>, name: string }[]) {
    forEach(schemas, d => {
      this.fields.set(
        d.name,
        Object.keys(d.schema).filter(k => !d.schema[k].virtual)
      )
      forEach(d.schema, (val, key) => {
        if (val.primaryKey) {
          this.primaryKeys.set(d.name, key)
          return false
        }
        return true
      })
    })
  }

  initMsgToDBHandler(handler: WSMsgToDBHandler) {
    this.msgToDB = handler
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

  handleApiResult<T>(
    result: ApiResult<T, CacheStrategy>
  ): QueryToken<T> {
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
      let p: Observable<any> | null = null

      switch (v.kind) {
      case 'CUD':
        p = database[(v as CUDBufferObject).method](v.tableName, v.value)
        break
      case 'SocketCUD':
        p = this.msgToDB(v.socketMessage, database)
        break
      case 'Selector':
        p = (() => {
          const cacheControl$ = v.proxySelector
          const token = this.handleRequestCache(v.realSelectorInfo)
          const selector$ = token.selector$

          return selector$
            .do({
              next(selector) {
                cacheControl$.next(selector)
              }
            })
        })()
        break
      default:
        break
      }

      if (p) {
        asyncQueue.push(p)
      }
    })

    this.persistedDataBuffer.length = 0

    return Observable.from(asyncQueue).concatAll().do({
      error: async (err: Observable<Error>) => {
        const errObj = await err.toPromise()
        SDKLogger.error(errObj.message)
      }
    })
  }

  bufferResponse<T>(result: ApiResult<T, CacheStrategy>) {

    const { request, q, tableName } = this.getInfoFromResult(result)
    const proxySelector = new ProxySelector<T>(
      request,
      q,
      tableName
    )
    const cacheControl$ = new BehaviorSubject<SelectorMeta<T>>(proxySelector)
    this.persistedDataBuffer.push({
      kind: 'Selector',
      realSelectorInfo: result,
      proxySelector: cacheControl$
    })

    return new QueryToken(cacheControl$).map(this.validate(result))
  }

  bufferCUDResponse<T>(result: CUDApiResult<T>) {
    const { request, method, tableName } = result as CUDApiResult<T>
    return request
      .do((v: T | T[]) => {
      this.persistedDataBuffer.push({
        kind: 'CUD',
        tableName,
        method: (method === 'create' || method === 'update') ? 'upsert' : method,
        value: method === 'delete' ? (result as UDResult<T>).clause : v
      })
    })
  }

  bufferSocketPush(socketMessage: ParsedWSMsg) {
    this.persistedDataBuffer.push({
      kind: 'SocketCUD',
      socketMessage
    })
    return Observable.of(null)
  }

  private genCacheKey<T>(tableName: string, q: Readonly<Query<T>>) {
    const key = `${tableName}:${JSON.stringify(q)}`
    return key
  }

  private handleRequestCache<T>(result: ApiResult<T, CacheStrategy>) {
    const database = this.database!
    const {
      request,
      q,
      cacheValidate,
      tableName
    } = this.getInfoFromResult(result)

    // 将类型 Observalbe<T> | Observable<T[]> 弱化为 Observable<T | T[]>
    const response$: Observable<T | T[]> = request
    const cacheKey = this.genCacheKey(tableName, q)
    const requestCache = this.requestMap.get(cacheKey)

    let token: QueryToken<T>
    switch (cacheValidate) {
      case CacheStrategy.Request:
        if (!requestCache) {
          /*tslint:disable no-shadowed-variable*/
          const selector$ = response$
            .concatMap(v => database.upsert(tableName, v))
            .do(() => this.requestMap.set(cacheKey, true))
            .concatMap(() => dbGetWithSelfJoinEnabled<T>(database, tableName, q).selector$)
          token = new QueryToken(selector$)
        } else {
          token = dbGetWithSelfJoinEnabled<T>(database, tableName, q)
        }
        token.map(this.validate(result))
        break
      case CacheStrategy.Cache:
        const selector$ = response$
          .concatMap(v => database.upsert(tableName, v))
          .concatMap(() => dbGetWithSelfJoinEnabled<T>(database, tableName, q).selector$)
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
