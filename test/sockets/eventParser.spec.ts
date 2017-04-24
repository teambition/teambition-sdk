import { eventParser, RequestEvent } from '../index'
import { describe, beforeEach, it } from 'tman'
import { expect } from 'chai'

describe('eventParser', () => {

  let event: RequestEvent
  
  beforeEach(() => {
    event = {
      id: 1,
      type: 'request',
      data: {
        id: 1,
        jsonrpc: '',
        method: 'publish',
        params: []
      }
    }
  })
  
  it('handles example correctly', () => {
    event.data.params.push("{\"e\":\":change:project/574bdf1c09bf88bd4f1dbb02\",\"d\":{\"uniqueIdPrefix\":\"QYGz\"}}")

    expect(eventParser(event)).to.deep.equal([{
      method: 'change',
      id: '574bdf1c09bf88bd4f1dbb02',
      type: 'project',
      data: { uniqueIdPrefix: 'QYGz' }
    }])
  })

  it('handles event strings that aren\'t prefixed with colon', () => {
    event.data.params.push("{\"e\":\"system:notifications\",\"d\":{\"name\":\"taskUniqueId\",\"status\":\"success\"}}")

    expect(eventParser(event)).to.deep.equal([{
      method: 'system',
      id: '',
      type: 'notifications',
      data: { name: 'taskUniqueId', status: 'success' }
    }])
  })
})
