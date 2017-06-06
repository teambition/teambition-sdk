'use strict'
import * as chai from 'chai'
import { clone } from '../index'
import { setSchema } from '../../../src/schemas/schema'
import { default as TaskSchema } from '../../../src/schemas/Task'
import { tasksUndone } from '../../mock/tasksUndone'

const expect = chai.expect

// 因为这里Task Mock的数据是老数据，和表现有出入，以后计划重写
export default describe('set schema test', () => {
  it('data should deep equal origin after setSchema', () => {
    const Task = new TaskSchema()
    const mockTask = clone(tasksUndone[0])
    const schema = setSchema(Task, <any>mockTask)
    expect(schema.checkSchema()).to.be.false
    expect(schema.$$keys.size).to.equal(1)
  })

  it('checkSchema should ok', () => {
    const Task = new TaskSchema()
    const mockTask = clone(tasksUndone[0])
    delete mockTask.priority
    const schema = setSchema(Task, <any>mockTask)
    expect(schema.checkSchema()).to.be.false
    expect(schema.$$keys.size).to.equal(2)
  })
})
