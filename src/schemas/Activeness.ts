import { ActivenessId } from 'teambition-types'
import { EventSchema } from './Event'
import { FileSchema } from './File'
import { PostSchema } from './Post'
import { ProjectSchema } from './Project'
import { TaskSchema } from './Task'

export interface ActivenessSchema {
  _id: ActivenessId
  boundToObject: EventSchema | FileSchema | PostSchema | TaskSchema
  boundToObjectType: 'event' | 'post' | 'task' | 'work'
  project: ProjectSchema
}
