'use strict'
/**
 * 这里的代码用来处理坏掉的后端 API
 * 做一些很脏的事情
 */

import { TaskData } from '../schemas/Task'
import { forEach } from './index'

export class Dirty {
  handlerMytasksApi (tasks: TaskData[]): TaskData[] {
    forEach(tasks, task => {
      delete task.subtaskCount
    })
    return tasks
  }
}

export default new Dirty()
