import { EventSchema } from '../../schemas/Event'
import { EventId } from 'teambition-types'

/**
 * 判断一个日程对象是否为重复日程。
 * 注意：有重复规则，但仅能推导得零个可用时间点的日程，会返回 true。
 */
export const isRecurrent = (event: EventSchema) =>
  !!event.recurrence && event.recurrence.length > 0

const msPerDay = 24 * 60 * 60 * 1000

// epoch time in current time zone
const epochTime = new Date(1970, 1, 1).valueOf()

/**
 * 判断一个日程是否为全天日程。
 * 目前全天日程的定义为，开始时间为零点，结束时间为第二天零点，或
 * 接下来第 n 天零点，的日程。
 * 注意：零点判断根据当地时区得。
 */
export const isAllDay = (e: EventSchema): boolean => {
  const startTime = new Date(e.startDate).valueOf()

  if ((startTime - epochTime) % msPerDay !== 0) {
    return false
  }

  const duration = new Date(e.endDate).valueOf() - startTime

  return duration > 0 && duration % msPerDay === 0
}

/**
 * 从重复日程实例上生成的 _id 获取原重复日程 _id。
 * （重复日程在使用时，根据重复规则，常被生成多个日程实例，每个这样的
 * 日程实例会带区别于原重复日程的 _id。）用例如：在一个重复日程的
 * 实例上更新数据，则最终需要通过原 _id 来与后端同步，此时，就可以
 * 使用该函数根据实例上的 _id 获得原 _id。
 */
export const originEventId = (id: EventId): EventId => {
  return id.split('_', 1)[0]
}
