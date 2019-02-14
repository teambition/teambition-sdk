import { Observable } from 'rxjs/Observable'
import { ErrorObservable } from 'rxjs/observable/ErrorObservable'
import { OperatorFunction } from 'rxjs/interfaces'
import { Clause, ExecutorResult, JoinMode, Predicate, Query, SchemaDef, Transaction, TransactionEffects } from 'reactivedb/interface'
import { QueryToken as RDBQueryToken, SelectorMeta } from 'reactivedb/proxy'

export * from 'reactivedb/interface'
export { ProxySelector, SelectorMeta } from 'reactivedb/proxy'

export interface Database {
  readonly inTransaction: boolean

  defineSchema: <T>(tableName: string, schema: SchemaDef<T>) => this
  connect: () => void
  dump: () => Observable<Object>
  load: (data: any) => Observable<void>

  // 类型重载
  insert<T>(tableName: string, raw: T[]): Observable<ExecutorResult>
  insert<T>(tableName: string, raw: T): Observable<ExecutorResult>
  insert<T>(tableName: string, raw: T | T[]): Observable<ExecutorResult>

  get: <T>(tableName: string, query?: Query<T>, mode?: JoinMode) => QueryToken<T>
  update: <T>(tableName: string, clause: Predicate<T>, raw: Partial<T>) => Observable<ExecutorResult>
  delete: <T>(tableName: string, clause?: Predicate<T>) => Observable<ExecutorResult>

  // 类型重载
  upsert<T>(tableName: string, raw: T): Observable<ExecutorResult>
  upsert<T>(tableName: string, raw: T[]): Observable<ExecutorResult>
  upsert<T>(tableName: string, raw: T | T[]): Observable<ExecutorResult>

  remove: <T>(tableName: string, clause?: Clause<T>) => Observable<ExecutorResult>
  dispose: () => ErrorObservable | Observable<ExecutorResult>
  attachTx: (effects: TransactionEffects) => void
  transaction: () => Observable<Transaction<Database>>
}

export interface QueryToken<T> extends RDBQueryToken<T> {
  selector$: Observable<SelectorMeta<T>>
  map: <K>(fn: OperatorFunction<T[], K[]>) => QueryToken<K>
  values: () => Observable<T[]>
  changes: () => Observable<T[]>
  concat: (...tokens: QueryToken<T>[]) => QueryToken<T>
  combine: (...tokens: QueryToken<any>[]) => QueryToken<T>
  toString: () => Observable<string>
}

export function createQueryToken<T>(selector$: Observable<SelectorMeta<T>>): QueryToken<T> {
  return new RDBQueryToken(selector$)
}
