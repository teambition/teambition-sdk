## 独立的数据层
  使用了下一代的fetch API / fetch polyfill 来处理请求

  使用了类似 vuejs 的依赖追踪来处理关联数据更新

  API默认返回标准 Promise 对象

  部分API可选返回Observable 对象
## Design Goal

为什么会需要一个独立的数据层：

现在有太多的请求 / 数据变更的监听放在 View 中处理

受限制于目前的架构，这些请求 / 监听可能会影响到其它 View 的业务逻辑代码

这就导致开发功能的程序员需要熟悉所有与手头业务相关的 View 中的逻辑，严重拖慢开发效率，不利于组件化

还有一些痛点类似于：
  - 受限制于 warehouse 的设计，目前的 model 需要很小心的更改它的属性，在需要临时更改一个对象的属性时非常的繁琐
  - 数据流非单向，事件通过 warehouse 辐射形传播，效率低下并且难以调试
  - 无法写单元测试，无法mock，各模块耦合严重

1. 数据变更自动追踪

  eg:

  View1:
  ```ts
  import {taskAPI} from 'tbsdk'
  import {ITaskData} from 'teambition'
  let task: ITaskData
  taskAPI.getOne(taskid).then((data: ITaskData) => {
    task = data
    console.log(task.content) //任务1
  })
  ```
  View2
  ```ts
  import {tasklistAPI} from 'tbsdk'
  import {ITaskData} from 'teambition'
  let task: ITaskData
  tasklistAPI.getTasks(tasklistId).then((data: ITaskData[]) => {
    tasks = data
    // 假设任务1在此任务列表中
    console.log(tasks[0].content) //任务1
  })
  ```
  View3:
  ```ts
  import {taskAPI} from 'tbsdk'
  taskAPI.update(taskid, {
    content: '任务22'
  })
  ```
  此时View1，View2 中 task.content 自动变更为'任务22'

2. [WIP]列表类型的数据自动变更排序

3. [WIP]元素被移除时自动从相应的列表中移除

4. [WIP]以类似Observable的方式操作数据
  eg:
  View1

  ```ts
  import {meAPI} from 'tbsdk'
  import * as moment from 'moment'
  import {sortMyRecent, errorHandler} from 'utils'
  let recents: any
  const week = moment().add(7, 'day').valueOf()
  meAPI.observable.getRecents()
  .filter(data => data.dueDate && moment(data.dueDate).valueOf() < week)
  .filter(data => data.endDate && moment(data.endDate).valueOf() < week)
  .sort(data => sortMyRecent(data))
  .done(data => recents = data)
  .error(err => errorHandler(error))
  ```
  View2:
  ```ts
  import {taskAPI} from 'tbsdk'
  import {me} from '../app'
  import {ITaskData} from 'teambition'
  taskAPI.create({
    content: '任务22',
    executor: me._id,
    dueDate: new Date().toISOString()
  }).then((data: ITaskdata) => {
    // 此时View1 中元素会自动新增并且排序完成
  })
  ```

5. [WIP]有新增的元素时自动插入符合条件的列表

6. [WIP]更新一个元素的属性时，可以通过beforeResponse确保正确渲染
  eg:
  拖动任务板中的元素时，我们希望在服务器返回结果之前界面就已经按照拖动的结果渲染
  ```ts
  import {taskAPI} from 'tbsdk'

  class View1 extends View {
    public onDragRelease(tasklistId: string) {
      taskAPI.beforeResponse.update({
        _tasklistId: tasklistId
      })
    }
  }
  ```
  出错时，数据将自动回滚到update 之前的状态，而界面也会自动渲染成拖动前的状态

7. mock:
  - backend.whenGET(url: string, query: JSON)
  - backend.whenPUT(url: string, data: JSON)
  - backend.whenPOST(url: string, data: JSON)
  - backend.whenDELETE(url: string)
  - backend.flush() flush http request

  ```ts
  import * as chai from 'chai'
  import {UserAPI, forEach, clone} from 'tbsdk'
  import {apihost} from '../app'
  import {Backend} from 'tbmock'
  import {userMe} from '../mockData'
  import {IUserMe} from 'teambition'

  const expect = chai.expect

  export default describe('UserAPI test', () => {

    let httpBackend: Backend

    beforeEach(() => {
      httpBackend = new Backend()
      httpBackend.whenGET(`${apihost}/users/me`).respond(userMe)
    })

    it('get user me should ok', (done: Function) => {
      UserAPI.getUserMe().then((data: IUserMe) => {
        forEach(userMe, (value: any, key: string) => {
          expect(userMe[key]).deep.equal(data[key])
        })
        done()
      })
      httpBackend.flush()
    })

    it('update user me should ok', (done: Function) => {
      let me: IUserMe
      const mockPut = clone({}, userMe)
      mockPut.name = 'test'

      httpBackend.whenPUT(`${apihost}/users/me`, {
        name: 'test'
      }).respond(mockPut)

      UserAPI.getUserMe().then((data: IUserMe) => {
        me = data
        return UserAPI.update({
          name: 'test'
        })
      })
      .then(() => {
        return UserAPI.getUserMe()
      })
      .then((data: IUserMe) => {
        expect(data.name).to.equal('test')
        expect(me.name).to.equal('test')
        done()
      })
      //延迟1秒返回结果
      setTimeout(() => {
        httpBackend.flush()
      }, 1000)
    })
  })

  ```

## [WIP]APIs:

1. UserAPI
  1. UserAPI.getUserMe(): Promise<IUserMe>
  2. UserAPI.update(patch: any): Promise<void>