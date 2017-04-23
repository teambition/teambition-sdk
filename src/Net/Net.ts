import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { forEach } from '../utils'
import {
  Database,
  SchemaDef,
  Query,
  Clause,
  ExecutorResult
} from 'reactivedb'

import Dirty from '../utils/Dirty'

import { QueryToken, SelectorMeta } from 'reactivedb/proxy'
import { ProxySelector } from 'reactivedb/proxy'

const ctx = typeof global === 'undefined' ? window : global

export enum CacheStrategy {
  Request = 200,
  Cache,
  Pass
}

export interface ApiResult<T, U extends CacheStrategy> {
  request: Observable<T[]> | Observable<T>
  query: Query<T>
  tableName: string
  cacheValidate: U
  assocFields?: AssocField<T>
  excludeFields?: string[]
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
  clause: Clause<T>
}

export type CUDApiResult<T> = CApiResult<T> | UDResult<T>

export class Net {
  constructor(
    schemas: { schema: SchemaDef<any>, name: string }[],
    public database: Database = undefined,
    public fields = new Map<string, string[]>(),
    private requestMap = new Map<string, boolean>(),
    private CUDBuffer: Object[] = [],
    private socketCUDBuffer: Object[] = [],
    private proxySelectorBuffer: BehaviorSubject<SelectorMeta<any>>[] = [],
    private realSelectorInfoBuffer: Object[] = [] // use to construct real selector
  ) {
    forEach(schemas, d => {
      this.fields.set(d.name, Object.keys(d.schema).filter(k => !d.schema[k].virtual))
    })
  }

  lift<T>(result: ApiResult<T, CacheStrategy.Cache>): QueryToken<T>

  lift<T>(result: ApiResult<T, CacheStrategy.Request>): QueryToken<T>

  lift<T>(result: ApiResult<T, CacheStrategy.Pass>): Observable<T> | Observable<T[]>

  lift<T>(result: CUDApiResult<T>): Observable<T>

  lift<T>(result: ApiResult<T, CacheStrategy> | CUDApiResult<T>) {
    if ((result as ApiResult<T, CacheStrategy>).cacheValidate) {
      return this.handleApiResult<T>(result as ApiResult<T, CacheStrategy>)
    } else {
      return this.handleCUDAResult<T>(result as CUDApiResult<T>)
    }
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
      throw new Error(`table: ${tableName} is not defined`)
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

  handleApiResult<T>(result: ApiResult<T, CacheStrategy>) {
    if (!this.database) { return this.bufferResponse(result) }
    const {
      request,
      q,
      cacheValidate,
      tableName
    } = this.getInfoFromResult(result)

    const sq = JSON.stringify(q)
    const requestCache = this.requestMap.get(sq)
    switch (cacheValidate) {
      case CacheStrategy.Request:
        if (!requestCache) {
          const selectMeta$ = request
            .concatMap<T | T[], T>(v => this.database.upsert(tableName, v))
            .do(() => this.requestMap.set(sq, true))
            .concatMap(() => this.database.get<T>(tableName, q).selector$)
          return new QueryToken<T[]>(<any>selectMeta$)
        } else {
          return this.database.get<T>(tableName, q)
        }
      case CacheStrategy.Cache:
        const selectMeta$ = this.database
          .get<T>(tableName, q)
          .values()
          .concatMap<T[], any>((cache: T[]) => {
            if (cache.length) {
              return this.database
                .get<T>(tableName, q)
                .selector$
            } else {
              return request.concatMap<T | T[], T>(val => {
                return this.database.upsert(tableName, val)
                  .concatMap(() => this.database.get<T>(tableName, q).selector$)
              })
            }
          })
        return new QueryToken(selectMeta$)
      case CacheStrategy.Pass:
      default:
        return request
    }
  }

  handleCUDAResult<T>(result: CUDApiResult<T>) {
    if (!this.database) { return this.bufferCUDResponse(result) }

    const { request, method, tableName } = result as CUDApiResult<T>
    let destination: Observable<ExecutorResult> | Observable<T | T[]>
    return request
      .concatMap(v => {
        switch (method) {
          case 'create':
            destination = this.database.upsert<T>(tableName, v)
            break
          case 'update':
            destination = this.database.upsert(tableName, v)
            break
          case 'delete':
            destination = this.database.delete<T>(tableName, (result as UDResult<T>).clause)
            break
          default:
            throw new Error()
        }
        return destination.mapTo<ExecutorResult | T | T[], T>(v)
      })
  }

  public persist<T>(database: Database) {
    if (!this.database) { this.database = database }
    const asyncQueue: Promise<void>[] = []
    forEach(this.realSelectorInfoBuffer, (v: any, idx) => {
      const q = v.q
      const sq = JSON.stringify(v.q)
      const request = v.request
      const tableName = v.tableName
      const proxySelector = this.proxySelectorBuffer[idx]
      if (v.type === CacheStrategy.Request) {
        const p = (request as Observable<T[]> | Observable<T>)
          .concatMap<T | T[], T>(val => database.upsert(tableName, val))
          .do(() => this.requestMap.set(sq, true))
          .concatMap(() => database.get<T>(tableName, q).selector$)
          .toPromise()
          .then((result: SelectorMeta<T>) => proxySelector.next(result))
        asyncQueue.push(p)
      } else if (v.type === CacheStrategy.Cache) {
        const p = (request as Observable<T[]> | Observable<T>)
          .concatMap<T | T[], T>(val => database.upsert(tableName, val))
          .concatMap(() => database.get<T>(tableName, q).selector$)
          .toPromise()
          .then((result: SelectorMeta<T>) => proxySelector.next(result))
        asyncQueue.push(p)
      }
    })

    this.realSelectorInfoBuffer = []
    this.proxySelectorBuffer = []

    forEach(this.CUDBuffer, (v: any) => {
      const p = database[v.method](v.tableName, v.value)
        .toPromise()
        .then(null, (err: any) => ctx['console']['error'](err))
      asyncQueue.push(p)
    })

    forEach(this.socketCUDBuffer, (v: any) => {
      const db = this.database
      const socketMessage = v.socketMessage
      const type = v.type
      const arg = v.arg
      const pkName = v.pkName
      if (socketMessage.method === 'destroy' || socketMessage.method === 'remove') {
        const p = db.delete(arg, {
          where: { [pkName]: socketMessage.id || socketMessage.data }
        })
          .toPromise()
          .then(null, (err: any) => ctx['console']['error'](err))
        asyncQueue.push(p)
      } else if (socketMessage.method === 'new') {
        const p = db.upsert(arg, socketMessage.data)
          .toPromise()
          .then(null, (err: any) => ctx['console']['error'](err))
        asyncQueue.push(p)
      } else if (socketMessage.method === 'change') {
        const dirtyStream = Dirty.handlerSocketMessage(socketMessage.id, type, socketMessage.data, db)
        if (dirtyStream) {
          const p = dirtyStream
            .toPromise()
            .then(null, (err: any) => ctx['console']['error'](err))
          asyncQueue.push(p)
        } else {
          const p = db.upsert(arg, {
            ...socketMessage.data,
            [pkName]: socketMessage.id
          })
            .toPromise()
            .then(null, (err: any) => ctx['console']['error'](err))
          asyncQueue.push(p)
        }
      }
    })
    this.socketCUDBuffer = []
    return Observable.from(asyncQueue)
  }

  public bufferResponse<T>(result: ApiResult<T, CacheStrategy>) {

    const {
    request,
      q,
      cacheValidate,
      tableName
  } = this.getInfoFromResult(result)

    const proxySelector = new ProxySelector<T>(request, q, tableName)
    const proxySelector$ = new BehaviorSubject(proxySelector)

    this.realSelectorInfoBuffer.push({ request, q, tableName, type: cacheValidate })
    this.proxySelectorBuffer.push(proxySelector$)
    return new QueryToken(proxySelector$)
  }

  public bufferCUDResponse<T>(result: CUDApiResult<T>) {
    const { request, method, tableName } = result as CUDApiResult<T>
    return request.do((v: T | T[]) => {
      this.CUDBuffer.push({
        tableName,
        method: ((method === 'create' || method === 'update') ? 'upsert' : method),
        value: method === 'delete' ? (result as UDResult<T>).clause : v
      })
    })
  }

  public bufferSocketPush(
    arg: string,
    socketMessage: Object,
    pkName: string,
    type: any
  ) {
    this.socketCUDBuffer.push({ arg, socketMessage, pkName, type })
    return Observable.of(null)
  }

}
