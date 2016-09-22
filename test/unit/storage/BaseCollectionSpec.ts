'use strict'
import * as chai from 'chai'
import { setSchema, Schema } from '../../../src/schemas/schema'
import BaseCollection from '../../../src/models/BaseCollection'

const expect = chai.expect

export default describe('models/BaseCollection test: ', () => {
  let collection: BaseCollection<any>
  let i = 20
  let page1: Schema<any>[]
  let page2: Schema<any>[]

  beforeEach(() => {
    collection = new BaseCollection('MockBaseCollection', (data: any) => {
      return data.score < 20
    }, `mock_collection_${++i}`, 5)

    let j = 0
    page1 = []
    page2 = []

    while (j < 10) {
      const result = setSchema(new Schema(), <any>{
        _id: `mockschema_${j}`
      })
      if (j < 5) {
        page1.push(result)
      } else {
        page2.push(result)
      }
      j++
    }
  })

  it('new collection should ok', () => {
    expect(collection).to.instanceof(BaseCollection)
  })

  it('add page1 should ok', done => {
    collection.addPage(1, page1)
      .subscribe(r => {
        expect(r.length).to.equal(5)
        done()
      })
  })

  it('add null to page1 should ok', done => {
    collection.addPage(1, null)
      .subscribe(r => {
        expect(r).to.be.null
        done()
      })
  })

  it('add page2 should ok', function* () {
    const signal = collection.addPage(1, page1)
      .publish()
      .refCount()

    signal.subscribe()

    yield signal.take(1)

    yield collection.addPage(2, page2)
      .take(1)

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(page1.length + page2.length)
      })
  })

  it('add page1 multi times should ok', function* () {
    yield collection.addPage(1, page1)
      .take(1)

    yield collection.addPage(1, page1)
      .take(1)
      .do(r => {
        expect(r.length).to.equal(page1.length)
      })
  })

  it('add page2 multi times should ok', function* () {
    const signal = collection.addPage(1, page1)
      .publish()
      .refCount()

    signal.subscribe()

    yield signal.take(1)

    yield [
      collection.addPage(2, page2)
        .take(1),
      collection.addPage(2, page2)
        .take(1)
    ]

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(page1.length + page2.length)
      })
  })

  it('has page should ok', done => {
    collection.addPage(1, page1)
      .subscribe(() => {
        expect(collection.hasPage(1)).to.be.true
        expect(collection.hasPage(2)).to.be.false
        done()
      })
  })

  it('get page 1 should ok', function* () {

    yield collection.addPage(1, page1)
      .take(1)

    yield collection.addPage(1, page1)
      .take(1)

    yield collection.get(1)
      .take(1)
      .do(r => {
        expect(r.length).to.equal(page1.length)
      })

  })

  it('get page2 should ok', function* () {
    yield collection.addPage(1, page1)
      .take(1)

    yield collection.addPage(2, page2)
      .concatMap(() => collection.get(2))
      .take(1)
      .do(r => {
        r.forEach((val, index) => {
          expect(val._id).to.equal(page2[index]['_id'])
        })
        expect(r.length).to.equal(page2.length)
      })
  })
})
