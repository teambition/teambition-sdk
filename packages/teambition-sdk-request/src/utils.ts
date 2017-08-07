import { Utils } from 'teambition-sdk-core'

export interface PagingQuery {
  page: number,
  count: number
}

export interface UrlPagingQuery extends PagingQuery {}

export interface SqlPagingQuery {
  skip: number,
  limit: number
}

const omitKeys = (srcObj: PagingQuery, ...keysToBeOmitted: string[]) => {
  const omitKeySet = new Set(keysToBeOmitted)
  return Object.keys(srcObj)
    .filter((key) => !(omitKeySet.has(key)))
    .reduce((destObj, key) => {
      destObj[key] = srcObj[key]
      return destObj
    }, {})
}

export const normPagingQuery = (
  query: Partial<PagingQuery> = {}
): { forUrl: UrlPagingQuery, forSql: SqlPagingQuery } => {
  const defaultPaging = { count: 500, page: 1 }

  let q: any = { ...defaultPaging, ...query }
  const forUrl = omitKeys(q, 'orderBy') as UrlPagingQuery

  q = { ...q, ...Utils.pagination(q.count, q.page) }
  const forSql = omitKeys(q, 'count', 'page') as SqlPagingQuery

  return { forUrl, forSql }
}
