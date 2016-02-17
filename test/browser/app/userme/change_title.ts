'use strict'
import {componments} from '../componment'
import {UserAPI} from '../tbsdk'

const changeFile = require('./input.html')

@componments({
  template: changeFile,
  selector: 'change-title',
  injectable: [UserAPI]
})
export class ChangeTitle {
  private title = ''

  constructor(private User: UserAPI) {}

  updateTitle() {
    if (!this.title.length) return
    return this.User.update({
      name: '龙逸楠',
      title: this.title
    })
    .then(() => {
      this.title = ''
    })
  }
}
