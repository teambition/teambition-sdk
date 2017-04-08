import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/mapTo'
import { Observable } from 'rxjs/Observable'
import {
  Database,
  Query,
  QueryToken,
  Clause,
  ExecutorResult
} from 'reactivedb'

import { forEach } from './utils'
import { SDKFetch } from './SDKFetch'
import { SocketClient } from './sockets/SocketClient'
import { SchemaColl } from './utils/internalTypes'

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

export const schemas: SchemaColl = []

export class SDK {
  fetch = new SDKFetch
  socketClient: SocketClient
  public fields = new Map<string, string[]>()
  private requestMap = new Map<string, boolean>()

  constructor(
    public database: Database
  ) {
    forEach(schemas, d => {
      database.defineSchema(d.name, d.schema)
      this.fields.set(d.name, Object.keys(d.schema).filter(k => !d.schema[k].virtual))
    })
    database.connect()
    this.socketClient = new SocketClient(database, this.fetch, schemas)
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

  handleApiResult<T>(result: ApiResult<T, CacheStrategy>) {
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
    const q = { ...query, fields }
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
          .concatMap<T[], any>(cache => {
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

}
