/**
 * 这里的代码用来处理坏掉的后端 API
 * 做一些很脏的事情
 */
import { SchemaDef } from 'reactivedb'
import { TaskSchema } from '../schemas/Task'
import { forEach } from './index'

export class Dirty {
  /**
   * 处理任务列表中坏掉的 subtaskCount 字段
   */
  handleMytasksApi (tasks: TaskSchema[]): TaskSchema[] {
    forEach(tasks, task => {
      delete task.subtaskCount
    })
    return tasks
  }

  getPKNameinSchema(schema: SchemaDef<any>): string {
    let pkName = ''

    const [next, stop] = [true, false]
    forEach(schema, (v, k) => {
      return (!v.primaryKey && next) || ((pkName = k) && stop)
    })

    return pkName
  }

  prefixWithColonIfItIsMissing(eventStr: string) {
    if (!eventStr.length) {
      return ':'
    }
    if (eventStr.charAt(0) !== ':') {
      return ':' + eventStr
    }
    return eventStr
  }
}

export default new Dirty
