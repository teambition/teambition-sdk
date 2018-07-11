'use strict'
import * as chai from 'chai'
import { setSchema } from '../../../src/schemas/schema'
import { default as TaskSchema } from '../../../src/schemas/Task'

const expect = chai.expect

// 因为这里Task Mock的数据是老数据，和表现有出入，以后计划重写
export default describe('set schema test', () => {
  it('data should deep equal origin after setSchema', () => {
    const schema = new TaskSchema()

    setSchema(schema, {})
    expect(schema.checkSchema()).to.be.false

    const task = {}
    for (const key of schema.$$keys) { task[key] = null }
    setSchema(schema, task)
    expect(schema.checkSchema()).to.be.true
    expect(schema.$$keys.size).to.equal(0)
  })

  it('checkSchema should ok', () => {
    const schema = new TaskSchema()
    setSchema(schema, {})
    const task = {}
    for (const key of schema.$$keys) { task[key] = null }
    delete task['_id']
    setSchema(schema, task)
    expect(schema.checkSchema()).to.be.false
    expect(schema.$$keys.size).to.equal(1)
  })
})
