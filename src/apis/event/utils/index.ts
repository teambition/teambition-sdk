import { EventSchema } from '../../../schemas/Event'
import { EventId } from 'teambition-types'
import { SDKLogger } from '../../../utils/Logger'

import * as ad from './all-day'

/**
 * 判断一个日程对象是否为重复日程。
 * 注意：有重复规则，但仅能推导得零个可用时间点的日程，会返回 true。
 */
export const isRecurrent = (event: Readonly<EventSchema>) =>
  !!event.recurrence && event.recurrence.length > 0

const msPerDay = 24 * 60 * 60 * 1000

// epoch time in current time zone
const epochTime = new Date(1970, 0, 1).valueOf()

/**
 * 判断一个日程是否为全天日程。
 */
export const isAllDay = (e: Readonly<EventSchema>): boolean => {
  const snippet = ad.getAllDayInfo(e)
  let currentResult: boolean
  const legacyResult = isAllDayLegacy(e)

  if (snippet) {
    currentResult = ad.isAllDay(snippet)

    if (currentResult !== legacyResult) { // for debugging purpose
      SDKLogger.warn('isAllDay migration incompatibility:', {
        current: e.isAllDay,
        legacy: legacyResult
      })
    }
    return currentResult
  } else {
    return legacyResult
  }
}

/**
 * LEGACY 全天日程的定义：开始时间为零点，结束时间为第二天零点，或
 * 接下来第 n 天零点，的日程。
 * 注意：零点判断根据当地时区得。
 */
const isAllDayLegacy = (e: Readonly<EventSchema>): boolean => {
  const startTime = new Date(e.startDate).valueOf()

  if ((startTime - epochTime) % msPerDay !== 0) {
    return false
  }

  const duration = new Date(e.endDate).valueOf() - startTime

  return duration > 0 && duration % msPerDay === 0
}

type StartEndDate = Pick<EventSchema, 'startDate' | 'endDate'>

export const normAllDayEventStartEndDateUpdate = (attrs: Readonly<StartEndDate>) => {
  const startDate = new Date(attrs.startDate)
  const endDate = new Date(attrs.endDate)

  const normedStartDate = new Date(Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  )).toISOString()
  const normedEndDate = new Date(Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  )).toISOString()

  return {
    startDate: normedStartDate,
    endDate: normedEndDate,
    allDayStart: normedStartDate.slice(0, 10),
    allDayEnd: normedEndDate.slice(0, 10)
  }
}

export function normFromAllDayAttrs(event: EventSchema): EventSchema
export function normFromAllDayAttrs(attrs: Partial<EventSchema>): Partial<EventSchema>
export function normFromAllDayAttrs(attrs: Partial<EventSchema>): Partial<EventSchema> {
  if (!attrs.isAllDay) {
    return attrs
  }

  const { allDayStart, allDayEnd, ...rest } = attrs

  if (allDayStart) {
    rest.startDate = allDayToDate(allDayStart)
  }
  if (allDayEnd) {
    rest.endDate = allDayToDate(allDayEnd)
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
    rest.allDayStart = dateToAllDay(startDate)
  }
  if (endDate) {
    rest.allDayEnd = dateToAllDay(endDate)
  }

  return rest
}

export const allDayToDate = (allDay: string): string => {
  const src = new Date(allDay)

  return new Date(
    src.getFullYear(),
    src.getMonth(),
    src.getDate()
  ).toISOString()
}

export const dateToAllDay = (date: string): string => {
  const src = new Date(date)

  src.setUTCFullYear(
    src.getFullYear(),
    src.getMonth(),
    src.getDate()
  )

  return src.toISOString().slice(0, 10)
}

export const rruleSetMethodWrapper =
  (normDate: { input?: (date: Date) => Date, output?: (date: Date) => Date } = {}) =>
  (context: any) =>
  (method: string, ...args: any[]) => {
    const { input, output } = normDate
    const ret = input
      ? context[method](...args.map((arg) => arg instanceof Date ? input(arg) : arg))
      : context[method](...args)

    return output && ret instanceof Date ? output(ret) : ret
  }

export const allDayRRuleSetMethodWrapper = (() =>
  rruleSetMethodWrapper({
    input: (date: Date) => new Date(dateToAllDay(date.toISOString())),
    output: (date: Date) => new Date(allDayToDate(date.toISOString()))
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
