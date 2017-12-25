import { API } from '../iface'
import { EventSchema } from '../../schemas'
import { normFromAllDayAttrs, normToAllDayAttrs, isAllDay } from './utils'

export const api: API<EventSchema> = {

  parse: (rawEvent) => {
    return normFromAllDayAttrs(rawEvent)
  },

  parsePatch: (patch, target?) => {
    const patch_isAllDay = patch.hasOwnProperty('isAllDay')
    if ((patch_isAllDay && patch.isAllDay) || (!patch_isAllDay && target && isAllDay(target))) {
      patch = normFromAllDayAttrs({ ...patch, isAllDay: true })
      if (!patch_isAllDay) {
        delete patch.isAllDay
      }
    }
    return patch
  },

  deparse: (parsed) => {
    return normToAllDayAttrs(parsed)
  },

  deparsePatch: (patch, target?) => {
    const patch_isAllDay = patch.hasOwnProperty('isAllDay')
    if ((patch_isAllDay && patch.isAllDay) || (!patch_isAllDay && target && isAllDay(target))) {
      patch = normToAllDayAttrs({ ...patch, isAllDay: true })
      if (!patch_isAllDay) {
        delete patch.isAllDay
      }
    }
    return patch
  }

}
