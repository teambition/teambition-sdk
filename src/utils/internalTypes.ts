/**
 * 项目中有些介于随手一写和公开定义之间的类型定义，
 * 有多个文件需要用到的，可以放此处。
 */

import { SchemaDef } from 'reactivedb/interface'
import { Database } from 'reactivedb'
import { Observable } from 'rxjs/Observable'

export type GeneralSchemaDef = SchemaDef<{}>

export type SchemaColl = {
  schema: GeneralSchemaDef,
  name: string,
  pkName: string
}[]

export type Dict<T> = {
  [key: string]: T
}

export type Omit<T, U> = Pick<T, Exclude<keyof T, U>>

export type TableInfo = {
  tabName: string,
  pkName: string
}

export interface PagingQuery {
  page: number,
  count: number
}

export interface UrlPagingQuery extends PagingQuery {}

export interface SqlPagingQuery {
  skip: number,
  limit: number
}

export interface ParsedWSMsg {
  // new change destroy refresh ...
  method: string
  // data id
  id: string

  // schema types: task, post, event, file, etc...
  type: string

  // optional data, null in delete
  data: any
  // original socket event string
  source: string
}

export type WSMsgToDBHandler = (
  msg: ParsedWSMsg,
  db: Database,
) => Observable<any>

export type WSMsgHandler = (msg: ParsedWSMsg) => Observable<any>

export type Variables = { [key: string]: any }

export interface GraphQLRequestContext {
  query: string
  variables?: Variables
}

// see: http://facebook.github.io/graphql/June2018/#sec-Errors
export type GraphQLError = {
  message: string
  path?: Array<string | number>
  locations?: Array<{ line: number, column: number }>
  extensions?: { [key: string ]: any }
}

// see: http://facebook.github.io/graphql/June2018/#sec-Response-Format
export interface GraphQLResponse<T = { [key: string]: any }> {
  data?: T | null // see: http://facebook.github.io/graphql/June2018/#sec-Data
  errors?: GraphQLError[] // see: http://facebook.github.io/graphql/June2018/#sec-Errors
  extensions?: any
  status: number
  [key: string]: any
}

export interface GraphQLRequest {
  header?: Headers
  credentials?: RequestCredentials
}

export interface GraphQLClientOption {
  host: string
  headers: object
}

// 给 queryString 上附上这两个类型信息让 graph 接口能够识别参数类型和返回值类型
export interface GraphQLMeta {
  result: unknown
  variables: unknown
}

export type GraphQLQuery = string | (string & GraphQLMeta)

export type GraphQLVariables<Q, V extends Variables> = Q extends GraphQLMeta ? Q['variables'] : V

export type GraphQLResult<Q, R> = Q extends GraphQLMeta ? Q['result'] : R
