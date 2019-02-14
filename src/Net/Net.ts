import 'rxjs/add/observable/forkJoin'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/concatAll'
import 'rxjs/add/operator/delayWhen'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/materialize'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/filter'
import { Observable } from 'rxjs/Observable'
import { OperatorFunction } from 'rxjs/interfaces'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { exhaustMap } from 'rxjs/operators/exhaustMap'
import { QueryToken, SelectorMeta, ProxySelector } from 'reactivedb/proxy'
import { JoinMode, Predicate, Query } from 'reactivedb/interface'
import { Database } from 'reactivedb'

import { forEach, isNonNullable, ParsedWSMsg, WSMsgToDBHandler, GeneralSchemaDef } from '../utils'
import { SDKLogger } from '../utils/Logger'

/**
 * 用于 SDK 非更新 `lift()` 接口 `CacheValidate` 字段的
 * 定义。常见的各种 getXXX 都属于非更新接口。（对用于更新的
 * `lift()` 接口，即所有 `method` 字段为 `'create' |
 * 'update' | 'delete'` 的，如常见的 updateXXX，无效。）
 *
 * 决定 SDK 非更新 `lift()` 接口内 `request` 字段对应的
 * Observable（一般是一个网络请求），在多次“同样的”调用下的
 * 缓存行为。
 *
 * Note: 两次非更新 `lift()` 调用是否是“同样的”，决定于它们
 * 的目标结果集是否相同。而对于一个规范的非更新 `lift()` 接口，
 * 其目标结果集的描述来自查询相关字段，如：`query`, `tableName`,
 * `fields` 等。这些字段会被用来生成缓存键。当两次非更新 `lift()`
 * 调用所得到的缓存键相同，这两次调用就被认为是“同样的”。
 * （缓存键的生成与 `request` 字段对应的 HTTP 请求信息无关。）
 */
export enum CacheStrategy {
  /**
   * 在多次同样的 `lift()` 调用里，仅第一次会执行 `request` 字段
   * 对应的 Observable。
   *
   * 如果我们相信第一次 `request` 得到的数据，结合后续来自其他
   * 更新源（如 websocket）的更新可以保证查询对应的结果集一直
   * 完整可用，使用该选项，以省略不必要的网络请求。
   */
  Request = 200,
  /**
   * 在多次同样的 `lift()` 调用里，每次都会执行 `request` 字段
   * 对应的 Observable。
   *
   * 如果第一次 `request` 得到的数据，结合后续来自其他更新源
   * （如 websocket）的更新，不足以保证查询对应的结果集一直完整
   * 可用；但同时，又有理由相信，其他更新源不完整的更新数据
   * （在 cache，即 rdb 里）依然能改善产品的数据同步，使用该选项，
   * 确保每次同样的 `lift()` 调用都会重新做网络请求，将结果集
   * 数据完整性保持在可控范围，并依赖来自其他更新源的数据提供
   * 产品上需要的同步能力。
   *
   * Note: 如果来自其他更新源的数据在产品上的价值微乎其微，可以
   * 选择直接使用 fetch 接口代替 `lift()` 接口。
   */
  Cache
}

export interface ApiResult<T, U extends CacheStrategy> {
  request: Observable<T> | Observable<T[]>
  /**
   * 使用 fields 指定需要查询的字段，where 指定查询条件，
   * orderBy 指定结果排序规则。更多支持的选项请见具体类型定义。
   */
  query: Query<T>
  tableName: string
  cacheValidate: U
  /**
   * 设定必须有值（非 undefined）的字段，在数据层尽可能
   * 保证推出的数据有这些字段。请搭配 padding 字段使用。
   */
  required?: (keyof T)[]
  /**
   * 指定需要关联其他数据模型（M）查询获得的字段，以及
   * 该字段对应值应该包含的 M 里的字段，如：
   * {
   *   creator: ['_id', 'name'],
   *   executor: ['_id', 'name', 'avatarUrl']
   * }
   */
  assocFields?: AssocField<T>
  /**
   * 指定不希望出现在查询结果里的字段。
   * 注：ApiResult.query.fields 中指定的希望出现的字段
   * 拥有更高优先级，除非 ApiResult.query.fields 未定义
   * 或为空（[]）。
   */
  excludeFields?: string[]
  /**
   * 与 required 字段搭配使用，用于补充数据（确保
   * required 字段有值）。当 required 中的字段缺值
   * （undefined），会使用提供的 padding 函数去获取完整
   * 数据。注意：请确保 padding 函数返回的 Observable 有
   * 异常处理机制（catch）。
   */
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

const fieldsPred =
  (include: string[] = [], exclude: string[] = []) => {
    if (include.length > 0) {
      return (field: string) => include.indexOf(field) >= 0
    } else {
      return (field: string) => exclude.indexOf(field) < 0
    }
  }

const missingFieldsChecker = <T>(fields: Array<keyof T>) => (item: T) =>
  fields.some((field) => typeof item[field] === 'undefined')

export class Net {
  public fields = new Map<string, string[]>()
  public database: Database | undefined
  private requestMap = new Map<string, boolean>()
  private primaryKeys = new Map<string, string>()
  public persistedDataBuffer: BufferObject[] = []
  private msgToDB: WSMsgToDBHandler | undefined

  private validate = <T>(result: ApiResult<T, CacheStrategy>) => {
    const { tableName, required, padding } = result

    const pk = this.primaryKeys.get(tableName)

    let fn: OperatorFunction<T[], T[]>

    if (!required || !padding || !pk) {
      fn = (stream$) => stream$ // pass through
    } else {
      const hasMissingFields = missingFieldsChecker(required)
      fn = exhaustMap((resultSet) => {
        const padding$ = Observable
          .from(resultSet.filter(hasMissingFields))
          .mergeMap((x) => {
            return padding(x[pk])
              .filter(isNonNullable)
              .delayWhen((resp) => this.database!.upsert(tableName, resp))
              .do((resp) => Object.assign(x, resp)) // side-effect
          })
        return Observable
          .of(resultSet)
          .delayWhen(() => padding$.materialize().takeLast(1))
      })
    }
    fn.toString = () => 'SDK_VALIDATE'
    return fn
  }

  constructor(schemas: { schema: GeneralSchemaDef, name: string }[]) {
    forEach(schemas, d => {
      this.fields.set(
        d.name,
        Object.keys(d.schema).filter(k => !d.schema[k].virtual)
      )
      forEach(d.schema, (val, key) => {
        if (val['primaryKey']) {
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

  lift<T>(result: ApiResult<T, CacheStrategy>): QueryToken<T>

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

    return request.delayWhen((v) => {
      switch (method) {
        case 'create':
          return database.upsert<T>(tableName, v)
        case 'update':
          return database.upsert(tableName, v)
        case 'delete':
          return database.delete<T>(tableName, (result as UDResult<T>).clause)
        default:
          throw new Error()
      }
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
          p = database[v.method](v.tableName, v.value)
          break
        case 'SocketCUD':
          if (this.msgToDB) {
            p = this.msgToDB(v.socketMessage, database)
          }
          break
        case 'Selector':
          const cacheControl$ = v.proxySelector
          const token = this.handleRequestCache(v.realSelectorInfo)
          const selector$ = token.selector$

          p = selector$
            .do({
              next(selector) {
                cacheControl$.next(selector)
              }
            })
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
            .delayWhen((v) => database.upsert(tableName, v))
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
          .delayWhen((v) => database.upsert(tableName, v))
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

    const fieldNames = preDefinedFields
      .filter(fieldsPred(query.fields as string[], excludeFields))

    const q: Query<T> = {
      ...query,
      fields: assocFields ? [assocFields as any, ...fieldNames] : fieldNames
    }

    return { request, q, cacheValidate, tableName }
  }
}
