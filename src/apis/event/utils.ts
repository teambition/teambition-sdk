import { EventData } from '../../schemas/Event'

export const isRecurrence = (event: EventData) => event.recurrence && event.recurrence.length

