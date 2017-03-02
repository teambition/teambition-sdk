import { EventSchema } from '../../schemas/Event'

export const isRecurrence = (event: EventSchema) => event.recurrence && event.recurrence.length
