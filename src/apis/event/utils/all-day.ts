import { EventSchema } from '../../../schemas/event'

const dateStrLen = 'YYYY-MM-DD'.length

type AllDayInfo = {
  isAllDay: boolean,
  allDayStart: string,
  allDayEnd: string
}

export const getAllDayInfo = (e: Readonly<EventSchema>): AllDayInfo | null => {
  const { isAllDay, allDayStart, allDayEnd } = e

  if (e.hasOwnProperty('isAllDay') &&
      e.hasOwnProperty('allDayStart') &&
      e.hasOwnProperty('allDayEnd')
  ) {
    return { isAllDay, allDayStart, allDayEnd }
  } else {
    return null
  }
}

export const generateStartEndDate = (info: AllDayInfo): { startDate: string, endDate: string } => {
  const start = new Date(info.allDayStart.slice(0, dateStrLen))
  const end = new Date(info.allDayEnd.slice(0, dateStrLen))

  // 获得当前时区的具体开始时间和结束时间，兼容 legacy 模式的全天日程定义。
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  }
}

export const isAllDay = (info: AllDayInfo): boolean => info.isAllDay
