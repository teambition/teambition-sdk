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
    event.data.params.push('{\"e\":\":change:project/574bdf1c09bf88bd4f1dbb02\",\"d\":{\"uniqueIdPrefix\":\"QYGz\"}}')

    expect(eventParser(event)).to.deep.equal([{
      method: 'change',
      id: '574bdf1c09bf88bd4f1dbb02',
      type: 'project',
      data: { uniqueIdPrefix: 'QYGz' }
    }])
  })

  it('handles event strings that aren\'t prefixed with colon', () => {
    event.data.params.push('{\"e\":\"system:notifications\",\"d\":{\"name\":\"taskUniqueId\",\"status\":\"success\"}}')

    expect(eventParser(event)).to.deep.equal([{
      method: 'system',
      id: '',
      type: 'notifications',
      data: { name: 'taskUniqueId', status: 'success' }
    }])
  })

  it('should handle both plain and TCM data format correctly', () => {
    const plain = '{"e":":change:event/59105f93280a100cffc678b3",'
      + '"d":{"commentsCount":7,"attachmentsCount":0,"lastCommentedAt":"2017-06-19T08:28:27.604Z"}}'
    const tcm = {
      appid: '58f95e92c06a546f7dab73c7',
      collapsekey: '',
      data: plain
    }
    event.data.params.push(plain)
    event.data.params.push(tcm as any)

    const expectedResult = {
      method: 'change',
      id: '59105f93280a100cffc678b3',
      type: 'event',
      data: {
        commentsCount: 7,
        attachmentsCount: 0,
        lastCommentedAt: '2017-06-19T08:28:27.604Z'
      }
    }
    const actualResults = eventParser(event)
    expect(actualResults[0]).to.deep.equal(expectedResult)
    expect(actualResults[1]).to.deep.equal(expectedResult)
  })
})
