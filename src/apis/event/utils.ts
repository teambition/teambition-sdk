import { EventSchema, AllDayEventSchema } from '../../schemas/Event'
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

namespace RS {
  const dateRE = /\d{8}(?!T)/g
  const dateSeperatorRE = /\-/g

  const dateTimeRE = /(\d{8})T(\d{6})Z/g
  const dateTimeSeperatorRE = /\-|\:/g

  const dateFragments = ['YYYY', 'MM', 'DD']
  const timeFragments = ['HH', 'mm', 'ss']

  const dropMsZLength = 'YYYY-MM-DDTHH:mm:ss'.length

  const join = (s: string, sep: string, templates: string[]): string => {
    const fragments: string[] = []
    for (let si = 0, ti = 0; ti < templates.length; ti++) {
      const len = templates[ti].length
      fragments.push(s.slice(si, si + len))
      si += len
    }
    return fragments.join(sep)
  }

  /**
   * 处理步骤：
   * 在 recurrence 里的每个元素都是一个字符串 S。找到 S 里每一个(no-overlapping)
   * yyyymmdd，将其转换为 yyyy-mm-dd。使用 dateToTime 转换为对应当地时间 yyyy-mm-dd
   * 当天的零点，YYYY-MM-DDTHH:mm:SS.xxxZ。拿掉分隔符和毫秒信息，得 YYYYMMDDTHHmmSSZ。
   */
  export const recurrenceDateToTime = (recurrence: string[]): string[] => {
    return recurrence.map((s) => {
      return s.replace(dateRE, (dateStr) => {
        const yyyy_mm_dd = join(dateStr, '-', dateFragments)
        const dateTimeStr = dateToTime(yyyy_mm_dd)
        const dropMsZ = dateTimeStr.slice(0, dropMsZLength)
        return dropMsZ.replace(dateTimeSeperatorRE, '') + 'Z'
      })
    })
  }

  /**
   * 非全天重复日程的重复规则，长得与全天重复日程的重复规则不一样，解析时的语义也不一样。
   * 非全天重复日程的重复规则，里面的每一个时间都是 DATE，而全天重复日程的重复规则，里面
   * 每一个时间都是 DATETIME。另外，对于它们时间的解析也不一样。同一个重复规则：
   * ["RRULE:FREQ=DAILY;DTSTART=201712020T160000Z"]
   * 如果属于一个全天日程，就应该映射到 ["RRULE:FREQ=DAILY;DTSTART=20171221"]；而如果它
   * 属于一个非全天日程，就应该映射到 ["RRULE:FREQ=DAILY;DTSTART=20171220T160000Z"]。
   *
   * 处理步骤：
   * 1. 在 recurrence 的每个元素都是一个字符串 S。找到 S 里的每一个（no-overlapping）
   * yyyymmddThhmmssZ，将其识别为 yyyy-mm-ddThh:mm:ssZ 代表的时间，使用 timeToDate 转换为
   * 字符串 YYYY-MM-DD，然后拿掉横杠，得 YYYYMMDD。在原字符串中，中 YYYYMMDD 代替 yyyymmddThhmmssZ。
   */
  export const recurrenceTimeToDate = (recurrence: string[]): string[] => {
    return recurrence.map((s) => {
      return s.replace(dateTimeRE, (_, dateStr, timeStr) => {
        const yyyy_mm_dd = join(dateStr, '-', dateFragments)
        const hh_mm_ss = join(timeStr, ':', timeFragments)
        const date = timeToDate(`${yyyy_mm_dd}T${hh_mm_ss}Z`)
        return date.replace(dateSeperatorRE, '')
      })
    })
  }
}

export function normFromAllDayAttrs(event: AllDayEventSchema): EventSchema
export function normFromAllDayAttrs(attrs: Partial<AllDayEventSchema>): Partial<EventSchema>
export function normFromAllDayAttrs(attrs: Partial<AllDayEventSchema>): Partial<EventSchema> {
  const { allDayStart, allDayEnd, ...rest } = attrs

  if (!attrs.isAllDay) {
    return rest
  }

  if (allDayStart) {
    rest.startDate = dateToTime(allDayStart)
  }
  if (allDayEnd) {
    const endDateObj = new Date(dateToTime(allDayEnd, true) + msPerDay)
    rest.endDate = endDateObj.toISOString()
  }
  if (rest.recurrence) {
    rest.recurrence = RS.recurrenceDateToTime(rest.recurrence)
  }
  return rest
}

export function normToAllDayAttrs(event: EventSchema): AllDayEventSchema
export function normToAllDayAttrs(attrs: Partial<EventSchema>): Partial<AllDayEventSchema>
export function normToAllDayAttrs(attrs: Partial<EventSchema>): Partial<AllDayEventSchema> {
  if (!attrs.isAllDay) {
    return attrs
  }

  const { startDate, endDate, ...rest } = attrs

  if (startDate) {
    (rest as Partial<AllDayEventSchema>).allDayStart = timeToDate(startDate)
  }
  if (endDate) {
    const endDateObj = new Date(timeToDate(endDate, true) - msPerDay);
    (rest as Partial<AllDayEventSchema>).allDayEnd = endDateObj.toISOString().slice(0, 10)
  }
  if (rest.recurrence) {
    rest.recurrence = RS.recurrenceTimeToDate(rest.recurrence)
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
    src.getUTCFullYear(),
    src.getUTCMonth(),
    src.getUTCDate()
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
