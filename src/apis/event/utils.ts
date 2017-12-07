import { EventSchema } from '../../schemas/Event'
import { EventId } from 'teambition-types'
import { SDKLogger } from '../../utils/Logger'

/**
 * 判断一个日程对象是否为重复日程。
 * 注意：有重复规则，但仅能推导得零个可用时间点的日程，会返回 true。
 */
export const isRecurrent = (event: Readonly<Partial<EventSchema>>) =>
  !!event.recurrence && event.recurrence.length > 0

/**
 * 判断一个日程是否为全天日程。
 */
export const isAllDay = (e: Readonly<EventSchema>): boolean => {
  const currentResult = e.isAllDay
  const legacyResult = isAllDayLegacy(e)

  if (currentResult !== legacyResult) {
    SDKLogger.warn('isAllDay migration incompatibility:', {
      current: currentResult,
      legacy: legacyResult,
      event: e
    })
  }

  return currentResult
}

const msPerDay = 24 * 60 * 60 * 1000

// epoch time in current time zone
const epochTime = new Date(1970, 0, 1).valueOf()

/**
 * LEGACY 全天日程的定义：开始时间为零点，结束时间为第二天零点，或
 * 接下来第 n 天零点，的日程。
 * 注意：零点判断根据当地时区得。
 */
export function isAllDayLegacy(e: Readonly<EventSchema>): boolean {
  const startTime = new Date(e.startDate).valueOf()

  if ((startTime - epochTime) % msPerDay !== 0) {
    return false
  }

  const duration = new Date(e.endDate).valueOf() - startTime

  return duration > 0 && duration % msPerDay === 0
}

export function normFromAllDayAttrs(event: EventSchema): EventSchema
export function normFromAllDayAttrs(attrs: Partial<EventSchema>): Partial<EventSchema>
export function normFromAllDayAttrs(attrs: Partial<EventSchema>): Partial<EventSchema> {
  if (!attrs.isAllDay) {
    return attrs
  }

  const { allDayStart, allDayEnd, ...rest } = attrs

  if (allDayStart) {
    rest.startDate = dateToTime(allDayStart)
  }
  if (allDayEnd) {
    const endDateObj = new Date(dateToTime(allDayEnd, true) + msPerDay)
    rest.endDate = endDateObj.toISOString()
  }
  return rest
}

export function normToAllDayAttrs(event: EventSchema): EventSchema
export function normToAllDayAttrs(attrs: Partial<EventSchema>): Partial<EventSchema>
export function normToAllDayAttrs(attrs: Partial<EventSchema>): Partial<EventSchema> {
  if (!attrs.isAllDay) {
    return attrs
  }

  const { startDate, endDate, ...rest } = attrs

  if (startDate) {
    rest.allDayStart = timeToDate(startDate)
  }
  if (endDate) {
    const endDateObj = new Date(timeToDate(endDate, true) - msPerDay)
    rest.allDayEnd = endDateObj.toISOString().slice(0, 10)
  }
  return rest
}

/**
 * 取输入中的日期信息，得当前时区同一日期零点的时间。如：北京时间环境下，
 * 输入 '2017-11-30'，会得 '2017-11-29T16:00:00.000Z'。若参数
 * returnValue 为 true，返回对应时间的毫秒数。
 */
export function dateToTime(date: string, returnValue: true): number
export function dateToTime(date: string, returnValue?: false): string
export function dateToTime(date: string, returnValue?: boolean) {
  const src = new Date(date)

  const ret = new Date(
    src.getFullYear(),
    src.getMonth(),
    src.getDate()
  )
  return returnValue ? ret.valueOf() : ret.toISOString()
}

/**
 * 取输入中的日期信息（根据当前时区解析），得对应日期的 'YYYY-MM-DD' 表达。
 * 如：北京时间环境下，输入 '2017-11-29T16:00:00.000Z'，会得 '2017-11-30'。
 * 若参数 returnValue 为 true，返回对应日期 UTC 零点的毫秒数，如：
 * new Date('2017-11-30T00:00:00.000Z').valueOf() 的值。
 */
export function timeToDate(date: string, returnValue: true): number
export function timeToDate(date: string, returnValue?: false): string
export function timeToDate(date: string, returnValue?: boolean) {
  const src = new Date(date)

  const ret = new Date(Date.UTC(
    src.getFullYear(),
    src.getMonth(),
    src.getDate()
  ))
  return returnValue ? ret.valueOf() : ret.toISOString().slice(0, 10)
}

export const rruleSetMethodWrapper =
  (normDate: { input?: (date: Date) => Date, output?: (date: Date) => Date } = {}) =>
  (context: any) =>
  (method: string, ...args: any[]) => {
    const { input, output } = normDate
    const ret = input
      ? context[method](...args.map((arg) => arg instanceof Date ? input(arg) : arg))
      : context[method](...args)

    if (method === 'all') {
      return output ? ret.map(output) : ret
    }
    return output && ret instanceof Date ? output(ret) : ret
  }

export const allDayRRuleSetMethodWrapper = (() =>
  rruleSetMethodWrapper({
    input: (date: Date) => new Date(timeToDate(date.toISOString())),
    output: (date: Date) => new Date(dateToTime(date.toISOString()))
  })
)()

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
