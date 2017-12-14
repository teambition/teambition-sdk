/**
 * 项目中有些介于随手一写和公开定义之间的类型定义，
 * 有多个文件需要用到的，可以放此处。
 */

import { SchemaDef } from 'reactivedb'

export type SchemaColl = {
  schema: SchemaDef<any>,
  name: string,
  pkName: string
}[]

export type Dict<T> = {
  [key: string]: T
}

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
