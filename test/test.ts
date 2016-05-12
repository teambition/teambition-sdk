'use strict'
import * as Rx from 'rxjs'
import Database from '../src/storage/Database'

const Storage = new Database()

Storage.storeOne({
  _id: '1',
  name: 'origin data',
  subData: {
    _id: '2',
    name: 'subData'
  },
  subArrayData: [
    {
      _id: '3',
      name: 'subArrayData 1'
    },
    {
      _id: '4',
      name: 'subArrayData 2'
    }
  ]
}).subscribe()

Storage.get('1')
  .subscribeOn(Rx.Scheduler.async, 100)
  .subscribe(r => {
    console.log('r: ', r)
  })

// Storage.updateOne('2', {
//   name: 'sub data sub data'
// }).subscribeOn(Rx.Scheduler.async, 200)
//   .subscribe()

// Storage.updateOne('2', {
//   name: 'sub data sub data 222222222'
// }).subscribeOn(Rx.Scheduler.async, 600)
//   .subscribe()

// Storage.updateOne('3', {
//   name: 'subArrayData 1111111'
// }).subscribeOn(Rx.Scheduler.async, 500)
//   .subscribe()

Storage.delete('1')
  .subscribeOn(Rx.Scheduler.async, 700)
  .subscribe(r => {
    console.log('delete', r)
  })

// Storage.storeCollection('collection_1', [
//   {
//     _id: '5',
//     data: 'tbsdk_test 5',
//     subData: {
//       _id: '6',
//       data: 'tbsdk_test 6'
//     }
//   },
//   {
//     _id: '7',
//     data: 'tbsdk_test 7',
//     subData: {
//       _id: '8',
//       data: 'tbsdk_test 8'
//     }
//   }
// ]).subscribe()

// Storage.get('collection_1')
//   .subscribeOn(Rx.Scheduler.async, 100)
//   .subscribe(r => {
//     console.log('r: ', r)
//   })

// Storage.updateOne('6', {
//   data: 'tbsdk_test 66666666'
// }).subscribeOn(Rx.Scheduler.async, 200)
//   .subscribe()

// Storage.updateOne('8', {
//   data: 'tbsdk_test 88888'
// }).subscribeOn(Rx.Scheduler.async, 500)
//   .subscribe()
