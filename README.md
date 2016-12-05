[![CircleCI](https://circleci.com/gh/teambition/teambition-sdk/tree/master.svg?style=svg)](https://circleci.com/gh/teambition/teambition-sdk/tree/master)
[![Dependency Status](https://david-dm.org/teambition/teambition-sdk.svg)](https://david-dm.org/teambition/teambition-sdk)
[![devDependency Status](https://david-dm.org/teambition/teambition-sdk.svg)](https://david-dm.org/teambition/teambition-sdk#info=devDependencies)

# isomorphic-sdk for Teambition APIs

## 设计理念

SDK 主要解决的是数据同步的问题。通俗点讲，就是在前端使用数据模型模拟出数据库的增删改查等操作。

为什么会有这种需求? 以 `https://api.teambition.com/tasks/:_id` 为例， Teambition 的 API 会返回下面格式的数据:

```json
{
  "_id": "001",
  "name": "task",
  "executor": {
    "_id": "002",
    "name": "executor 1",
    "avatarUrl": "https://xxx"
  },
  "subtasks": [
    {
      "_id": "003",
      "name": "subtask",
      "executor": {
        "_id": "004",
        "name": "executor 2",
        "avatarUrl": "https://xxx"
      }
    }
  ]
}
```

而倘若这个任务中包含的子对象，比如 `executor` 字段对应的数据通过其它 API 进行了变更:

```ts
/**
 * @url https://api.teambition.com/subtasks/:_id
 * @method put
 * @body {name: 'executor test'}
 */
SubtasksAPI.update('002', {
  name: 'subtask update'
})
  .subscribe()
```

在前端，需要自行处理与此 subtask 相关的所有变更情况。例如:

1. 包含这个子任务的列表中的这个子任务名字的变更。
2. 包含这个子任务的任务的详情页中，该子任务名字的变更。

然而在现有的 Teambition 数据模型中，需要在每一个 `Model` 或者 `Collection` 或者 `View` 中手动监听与自己相关联的数据，例如:

```js
// 匹配第一种情况
class MyTasksView extends Backbone.View {
  ...
  listen() {
    this.listenTo(warehouse, ':change:task', model => {
      // handler
    })
    this.listenTo(warehouse, ':change:subtask', model => {
      // handler
    })
  }
}
```

```js
// 匹配第二种情况

class SubtaskCollection extends Backbone.Collection {
  ...

  constructor() {
    this.on('add destroy remove change:isDone', () =>
      Socket.trigger(`:change:task/${this._boundToObjectId}`, {
        subtaskCount: {
          total: this.length
          done: this.getDoneSubTaskCount()
        }
      })
    )
  }
  getDoneSubTaskCount() {
    this.where({isDone: true}).length
  }
}

class TaskView extends Backbone.View {
  ...
  listen() {
    this.listenTo(this.taskModel, 'change', this.render)
  }
}
```

而在当前的设计中，所有的这种变更情况都在数据层处理，视图/业务 层只需要订阅一个数据源，这个数据源随后的所有变更都会通知到订阅者。
比如获取一个任务:

```ts
import 'rxjs/add/operator/distinctUntilKeyChanged'
import { TasksAPI } from 'teambition-sdk'
import { Component, Input } from '@angular/core'

@Component({
  selector: 'task-detail',
  template: `
    <div> {{ task$?.name | async }} </div>
    <div> {{ subtaskCount$ | async }} </div>
  `
})
export default class TaskView {

  @Input('taskId') taskId: string

  private task$ = this.TaskAPI.get(this.taskId)
    .publishReplay(1)
    .refCount()

  private subtaskCount$ = this.task$
    .distinctUntilKeyChanged('subtasks')
    .map(task => ({
      total: task.subtasks.length,
      done: task.subtasks.filter(x => x.isDone).length
    }))

  constructor(
    private TasksAPI: TasksAPI
  ) { }
}
```


如果更加纯粹的使用 RxJS，甚至可以组合多种数据和业务:


```ts
import 'rxjs/add/operator/distinctUntilKeyChanged'
import 'rxjs/add/operator/distinctUntilChanged'
import { PermissionAPI, TasksAPI, ProjectAPI } from 'teambition-sdk'
import { Component, Input } from '@angular/core'
import * as moment from 'moment'
import { errorHandler } from '../errorHandler'

@Component({
  selector: 'task-detail',
  template: `
    <div [ngClass]="{'active': permission$.canEdit | async}"></div>
    <div> {{ task$?.name | async }} </div>
    <div> {{ subtaskCount$ | async }} </div>
    <div> {{ dueDate$ | async }} </div>
  `
})
export default class TaskView {

  @Input('taskId') taskId: string

  private task$ = this.TaskAPI.get(this.taskId)
    .catch(err => errorHandler(err))
    .publishReplay(1)
    .refCount()

  private subtaskCount$ = this.task$
    .distinctUntilKeyChanged('subtasks')
    .map(task => ({
      total: task.subtasks.length,
      done: task.subtasks.filter(x => x.isDone).length
    }))

  private dueDate$ = this.task$
    .map(task => moment(task.dueDate).format())

  private project$ = this.task$
    .distinctUntilKeyChanged('_projectId')
    .switchMap(task => this.ProjectAPI.get(task._projectId))
    .catch(err => errorHandler(err))
    .publishReplay(1)
    .refCount()

  private permission$ = this.task$
    .distinctUntilChanged((before, after) => {
      return before._executorId === after._executorId &&
        before._projectId === after._projectId
    })
    .switchMap(task => {
      return this.project$
        .distinctUntilKeyChanged('_defaultRoleId')
        .switchMap(project => {
          return this.PermissionAPI.getPermission(task, project)
        })
    })
    .catch(err => errorHandler(err))
    .publishReplay(1)
    .refCount()

  constructor(
    private TasksAPI: TasksAPI,
    private PermissionAPI: PermissionAPI
  ) { }
}
```

在这种场景下，关于 task 的任何变更 (tasklist 变更，executor 变更，stage 变更等等，权限变化) 都能让相关的数据自动更新，从而简化 View 层的逻辑。
