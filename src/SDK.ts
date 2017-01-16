import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/mapTo'
import {
  Database,
  QueryDescription,
  QueryToken,
  SchemaDef,
  ClauseDescription
} from 'reactivedb'
import { Observable } from 'rxjs/Observable'
import { forEach } from './utils'
import { SDKFetch } from './SDKFetch'

export type CacheValidate = 'request' | 'cache' | undefined

export interface ApiResult<T, U extends CacheValidate> {
  request: Observable<T[]> | Observable<T>
  query: QueryDescription
  tableName: string
  cacheValidate: U
  assoFields?: {
    [P in keyof T]?: string[]
  }
  excludeFields?: string[]
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
  clause: ClauseDescription
}

export type CUDApiResult<T> = CApiResult<T> | UDResult<T>

export const schemas: { schema: SchemaDef<any>, name: string }[] = []

export class SDK {
  fetch = new SDKFetch
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
  }

  lift<T>(result: ApiResult<T, 'cache'>): QueryToken<T>

  lift<T>(result: ApiResult<T, 'request'>): QueryToken<T>

  lift<T>(result: ApiResult<T, undefined>): Observable<T> | Observable<T[]>

  lift<T>(result: CUDApiResult<T>): Observable<T>

  lift<T>(result: ApiResult<T, CacheValidate> | CUDApiResult<T>) {
    if ((<ApiResult<T, CacheValidate>>result).cacheValidate) {
      const {
        query,
        tableName,
        cacheValidate,
        request,
        assoFields,
        excludeFields
      } = result as ApiResult<T, CacheValidate>
      const preDefinedFields = this.fields.get(tableName)
      if (!preDefinedFields) {
        throw new Error(`table: ${tableName} is not defined`)
      }
      const fields: string[] = []
      if (assoFields) {
        fields.push(<any>assoFields)
      }
      const s = new Set(excludeFields)
      forEach(this.fields.get(tableName), f => {
        if (!s.has(f)) {
          fields.push(f)
        }
      })
      const q = { ...query, fields }
      const sq = JSON.stringify(q)
      const requestCache = this.requestMap.get(sq)
      switch(cacheValidate) {
        case 'request':
          if (!requestCache) {
            const selectMeta$ = request
              .concatMap<T | T[], T>(v => this.database.insert(tableName, v))
              .do(() => this.requestMap.set(sq, true))
              .concatMap(() => this.database.get<T>(tableName, q).selectMeta$)
            return new QueryToken<T[]>(<any>selectMeta$)
          } else {
            return this.database.get<T>(tableName, q)
          }
        case 'cache':
          const selectMeta$ = this.database
            .get<T>(tableName, q)
            .values()
            .concatMap<T[], any>(cache => {
              if (cache.length) {
                return this.database
                  .get<T>(tableName, q)
                  .selectMeta$
              } else {
                return request.concatMap<T | T[], T>(val => {
                  return this.database.insert(tableName, val)
                    .concatMap(() => this.database.get<T>(tableName, q).selectMeta$)
                })
              }
            })
          return new QueryToken(selectMeta$)
        default:
          return request
      }
    } else {
      const { request, method, tableName } = result as CUDApiResult<T>
      let destination: Observable<T[]> | Observable<T>
      return request
        .concatMap(v => {
          switch (method) {
            case 'create':
              destination = this.database.insert<T>(tableName, v)
              break
            case 'update':
              destination = this.database.update(tableName, (result as UDResult<T>).clause, v)
              break
            case 'delete':
              destination = this.database.delete<T>(tableName, (result as UDResult<T>).clause)
              break
          }
          return destination.mapTo<T | T[], T>(v)
        })
    }
  }

}
