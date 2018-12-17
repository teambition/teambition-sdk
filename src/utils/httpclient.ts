import { Omit } from './internalTypes'
import { SDKLogger } from './Logger'

/**
 * 从类型 T（如 `{ taskIds: TaskId[] }`）上获得给定字段 K
 * （如 `taskIds`）对应的数组的元素类型（如 `TaskId`）。如果
 * `T[K]` 不是数组类型，则放弃类型推断，返回 any。
 */
export type ArrayPropertyElement<
  T,
  K extends keyof T
> = T[K] extends (infer U)[] ? U : any

/**
 * 生成的结果类型，替换了类型 T（如 `{ taskIds: TaskId[], isArchived: boolean }`）
 * 上的字段 K（如 `taskIds`）为字段 S（如 `_id`），而字段 S
 * 对应的值类型则是字段 K 对应的数组值的元素类型（如 `TaskId`）。
 * 如果 `T[K]` 不是数组类型，则字段 S（如 `_id`）的类型将是 any。
 */
export type NormBulkUpdateResult<
  T,
  K extends keyof T,
  U extends string
> = Array<Record<U, ArrayPropertyElement<T, K>> & Omit<T, K>>

/**
 * 将批量 PUT 的返回结果转变为可以直接被缓存层消费的数据。
 * 用法如：有 response$ 的元素形状为
 *   `{ taskIds: TaskId[], isArchived: boolean, updated: string }`
 * 则 `response$.map(normBulkUpdate('taskIds', '_id'))` 将推出元素形状为
 *   `{ _id: TaskId, isArchived: boolean, updated: string }[]`
 * 的数据。
 */
export const normBulkUpdate = <
  T,
  K extends keyof T = keyof T,
  U extends string = string
>(
  responseIdsField: K,
  entityIdField: U
) => (
  response: T
): NormBulkUpdateResult<T, K, U> => {
  if (response == null || typeof response !== 'object') {
    return []
  }
  const { [responseIdsField]: ids, ...rest } = response as any
  return !ids
    ? []
    : ids
      .map((id: ArrayPropertyElement<T, K>) => {
        const currentValue = rest[entityIdField]

        if (currentValue == null || currentValue === id /* not likely */) {
          return { ...rest, [entityIdField]: id }
        }

        const incoming = `${entityIdField}-${id}`
        const current = `${entityIdField}-${currentValue}`
        SDKLogger.warn('normBulkUpdate:' +
          ` specified key-value pair(${incoming})` +
          ` conflicts with an existing one(${current}).)`
        )
        return rest
    })
}
