import { Marshaler } from '../marshaler'
import { AllDayEventSchema, EventSchema } from '../../schemas'
import { normFromAllDayAttrs, normToAllDayAttrs, isAllDay as isAllDayEvent } from './utils'

export const marshaler: Marshaler<EventSchema> = {

  parse: (rawEvent) => {
    return normFromAllDayAttrs(rawEvent as AllDayEventSchema)
  },

  parsePatch: (patch, target?) => {
    const patchIsAllDay = patch.hasOwnProperty('isAllDay')
    if ((patchIsAllDay && patch.isAllDay) || (!patchIsAllDay && target && isAllDayEvent(target))) {
      patch = normFromAllDayAttrs({ ...patch, isAllDay: true })
      if (!patchIsAllDay) {
        const { isAllDay, ...rest } = patch
        patch = rest
      }
    }
    return patch
  },

  deparse: (parsed) => {
    return normToAllDayAttrs(parsed)
  },

  deparsePatch: (patch, target?) => {
    const patchIsAllDay = patch.hasOwnProperty('isAllDay')
    if ((patchIsAllDay && patch.isAllDay) || (!patchIsAllDay && target && isAllDayEvent(target))) {
      patch = normToAllDayAttrs({ ...patch, isAllDay: true })
      if (!patchIsAllDay) {
        const { isAllDay, ...rest } = patch
        patch = rest
      }
    }
    return patch
  }

}

/**
 * 将弃用，请使用 marshaler
 */
export const api = marshaler
