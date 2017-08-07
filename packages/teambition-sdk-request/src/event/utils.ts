import { EventSchema } from 'teambition-sdk-core'

export const isRecurrence = (event: EventSchema) => event.recurrence && event.recurrence.length
