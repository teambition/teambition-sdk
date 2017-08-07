'use strict'
import { Database, DataStoreType } from 'reactivedb'
import { SDK } from 'teambition-sdk-core'
import { testable } from 'teambition-sdk-core/dist/cjs/testable'
import { EventGenerator, isRecurrence } from '../src/event'

testable.UseXMLHTTPRequest = false

export function createSdk() {
  const sdk = new SDK()

  const database = new Database(DataStoreType.MEMORY, false, 'teambition-sdk', 1)
  sdk.initReactiveDB(database)

  return sdk
}

export function createSdkWithoutRDB() {
  return new SDK()
}

export function loadRDB(sdk: SDK) {
  const database = new Database(DataStoreType.MEMORY, false, `teambition-sdk-test`, 1)
  return sdk.initReactiveDB(database)
}

export function normIfRecurrentEvent(myRecent: any[]): any[] {
  return myRecent.map((eventOrTask): any => {
    if (eventOrTask.type === 'task' || !isRecurrence(eventOrTask as any)) {
      return eventOrTask
    }
    const egen = new EventGenerator(eventOrTask as any)
    return egen.next().value
  })
}

export * from '../src/index'
