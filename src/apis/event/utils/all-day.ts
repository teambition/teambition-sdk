import { EventSchema } from '../../../schemas/Event'

type AllDayInfo = {
  isAllDay: boolean,
  allDayStart?: string,
  allDayEnd?: string
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

export const isAllDay = (info: AllDayInfo): boolean => info.isAllDay
