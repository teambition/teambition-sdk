'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import { Backend, parseObject, reParseQuery } from '../index'
import { describe, it, afterEach, beforeEach } from 'tman'

const expect = chai.expect
chai.use(sinonChai)

describe('mock test: ', () => {
  let httpBackend: Backend

  beforeEach(() => {
    httpBackend = new Backend()
  })

  it('parseObject should ok', () => {
    const queryObj = {
      b: 2,
      a: 1,
      d: 4,
      c: 3
    }
    expect(parseObject(queryObj)).to.equal('a=1&b=2&c=3&d=4')
  })

  it('reParseQuery should ok', () => {
    const uri = 'http://api.project.ci/users/me?b=2&a=1&d=4&c=3'
    expect(reParseQuery(uri)).to.equal('http://api.project.ci/users/me?a=1&b=2&c=3&d=4')
  });

  ['get', 'post', 'put', 'delete'].forEach(method => {
    it(`mock ${method} should ok`, function* () {
      const respond = {
        name: 'mock respond',
        type: `${method} test`
      }
      const uri = `http://mock.teambition.com/api/test`
      httpBackend[`when${method.toLocaleUpperCase()}`](uri)
        .respond(JSON.stringify(respond))

      const response: Response = yield fetch(`http://mock.teambition.com/api/test`, {
        method: method
      })

      const responsed = yield response.json()

      expect(respond).to.deep.equal(responsed)
    })
  })

  describe('get test', () =>  {
    it('uri has query should ok', function* () {
      const uri = `http://mock.test/?id=1&=2`
      httpBackend.whenGET(uri)
        .respond('1')

      const response: Response = yield fetch(uri, {
        method: 'get'
      })
      const responsed = yield response.text()

      expect(responsed).to.equal('1')
    })

    it('query as param should ok', function* () {
      const uri = `http://mock.test/`
      httpBackend.whenGET(uri, {
        id: 1
      })
        .respond('1')

      const response: Response = yield fetch(`${uri}?id=1`, {
        method: 'get'
      })
      const responsed = yield response.text()

      expect(responsed).to.equal('1')
    })

    it('query with url and with query param should ok', function* () {
      httpBackend.whenGET(`http://mock.test/?page=1&count=2`, {
        foo: 'bar'
      })
        .respond('2')

      const response: Response = yield fetch(`http://mock.test/?page=1&count=2&foo=bar`, {
        method: 'get'
      })

      const responsed = yield response.text()

      expect(responsed).to.equal('2')
    })
  });

  ['put', 'post'].forEach(method => {
    describe(`${method} test`, () => {
      it('uri with query should ok', function* () {
        const uri = 'http://mock.test/?_id=1&name=2'
        const respond = {
          method,
          name: 'respond'
        }

        httpBackend[`when${method.toUpperCase()}`](uri)
          .respond(respond)

        const response: Response = yield fetch(uri, { method })

        const responsed = yield response.json()

        expect(responsed).to.deep.equal(respond)
      })

      it('uri with query and with body should ok', function* () {
        const uri = `http://mock.test/?foo=bar`
        httpBackend[`when${method.toUpperCase()}`](uri, { id: 1 })
          .respond('1')

        const response: Response = yield fetch(`${uri}&id=1`, { method })
        const responsed = yield response.text()

        expect(responsed).to.equal('1')
      })
    })

  })

  it('delete should ok', function* () {
    const uri = `http://mock.test/1`
    httpBackend.whenDELETE(uri)
      .respond({})

    yield fetch(uri, {
      method: 'delete'
    })
  })
})

describe('mock test: on waiting', () => {

  let httpBackend: Backend
  let clock: sinon.SinonFakeTimers

  beforeEach(() => {
    httpBackend = new Backend()
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  it('wait respond should ok', function* () {
    const uri = 'http://mock.test/1'
    const callback = sinon.spy(() => void 0)

    httpBackend.whenGET(uri)
      .respond('1', null, 100)

    const request = fetch(uri, { method: 'get' })
      .then(() => {
        callback()
      })

    setTimeout(() => {
      expect(callback).not.be.called
    }, 90)

    clock.tick(100)

    yield request

    expect(callback).to.be.calledOnce
  })

  it('wait promise resolved and respose should ok', function* () {
    const uri = 'http://mock.test/1'
    const callback = sinon.spy(() => void 0)

    const wait = new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 100)
    })

    httpBackend.whenGET(uri)
      .respond('1', null, wait)

    const request = fetch(uri, { method: 'get' })
      .then(() => {
        callback()
      })

    setTimeout(() => {
      expect(callback).not.be.called
    }, 90)

    clock.tick(110)

    yield request

    expect(callback).to.be.calledOnce
  })
})
