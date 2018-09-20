import { describe, it } from 'tman'
import { expect } from 'chai'

import { of, Observable } from 'rxjs'
import { QueryToken } from 'reactivedb'

import { redirectLike } from '../../src/sockets/interceptor'

import { Socket } from '../'

import '../index'

/**
 * 测试样本数据的类型
 */
type Sample = {
  // 要测试的中间件要面对的输入消息
  inputMessage: any,

  // 要测试的中间件应该对输入消息变换而得的消息；
  // 若对输入消息不做变换，或所得消息与原消息相等，不需要提供此字段。
  outputMessage?: any

  returnValue?: any
}

type MockDatabase = Partial<{
  upsert: (...args: any[]) => Observable<any>,
  delete: (...args: any[]) => Observable<any>,
  insert: (...args: any[]) => Observable<any>,
  update: (...args: any[]) => Observable<any>,
  remove: (...args: any[]) => Observable<any>,
  get: (...args: any[]) => QueryToken<any>
}>

/**
 * 根据提供的测试目标中间件和匹配的 mock Database 对象（可选），生成
 * 相应测试程序，该测试程序针对所提供的一条消息会跑一次完整的测试。
 * @param handler 要测试的中间件
 * @param mockDB 中间件运行过程中可能要用的 Database 对象 mock
 */
const createTest = (
  handler: Socket.CustomMsgHandler,
  options: {
    mockDB?: MockDatabase,
    isNotIdempotent?: boolean
  } = {}
) => (
  { inputMessage, outputMessage, returnValue }: Sample
) => {
  const expectedMsg = typeof outputMessage === 'undefined'
    ? JSON.parse(JSON.stringify(inputMessage))
    : outputMessage

  const expectedRet = typeof returnValue === 'undefined'
    ? Socket.InterceptorsControlFlow.PassThrough
    : returnValue

  const wrapped = new Socket.Interceptors()
  wrapped.append(handler, {
    // 为 wrapper 配置 mutate，以便观察 message 变换的副作用
    mutate: true
  })

  const actualRet = wrapped.apply(inputMessage, (options.mockDB as any) || undefined)

  // 验证在经过目标拦截器后，原消息对象上可能的变更符合预期
  expect(inputMessage).to.deep.equal(expectedMsg)
  if (!options.isNotIdempotent) {
    /**
     * 默认验证目标拦截器（f）对原消息（x）可能作用的变更（f(x)）
     * 在二次作用时是稳定的：f(f(x)) = f(x)。
     *
     * 放弃这一属性，意味着如果后端改正了消息格式，或前端 mock 出
     * 已经不需要处理的消息格式，目标拦截器对原消息的变更行为将是
     * 不明确的，不可预期的。（如平时文本编辑中查找修改 'x' 为 'xx'，
     * 就可能出现会把文中已经是 'xx' 的内容改为 'xxx'，进而 'xxxx'，
     * ……，行为不可控；而如果指定要匹配词边界，就不会出现这样的问题。）
     */
    const inputMessage2 = JSON.parse(JSON.stringify(inputMessage))
    wrapped.apply(inputMessage2, (options.mockDB as any) || undefined)
    expect(inputMessage2).to.deep.equal(inputMessage)
  }

  // 验证拦截器的返回值符合预期
  if (typeof expectedRet === 'function') {
    /**
     * 当预期的返回值被定义为函数，使用该函数来判断拦截器实际
     * 所得返回值是否符合预期（该函数的定义中可以使用如 expect
     * 这样的语句）
     */
    const customReturnSpec = expectedRet
    customReturnSpec(actualRet)
  } else {
    /**
     * 否则，直接判断拦截器实际所得返回值是否与预期返回值相等
     */
    expect(actualRet).to.deep.equal(expectedRet)
  }
}

/**
 * 利用 of() 会默认使用同步（非异步） scheduer 的特性，方便测试
 */
const synchronousDB: MockDatabase = {
  upsert: (tabName: string, data: any) => {
    return of({
      table: tabName,
      row: data,
      kind: 'upsert'
    })
  },
  get: () => {
    return {
      values: () => {
        return of([])
      }
    } as any
  }
}

describe('interceptors', () => {

  const redirectLikeSamples: () => Sample[] = () => [{
    inputMessage: {
      id: '123',
      type: 'project',
      method: 'new',
      data: {
        likesGroup: []
      }
    },
    returnValue: (ret: any) => {
      expect(ret instanceof Observable).to.equal(true)

      const ret$: Observable<any> = ret

      ret$.subscribe((ops) => {
        expect(ops.length).to.equal(1)
        const op = ops[0]

        expect(op.kind).to.equal('upsert')
        expect(op.table).to.equal('Like')
        expect(op.row).to.deep.equal({ _id: '123:like', likesGroup: [] })
      })
    }
  }, {
    inputMessage: {
      id: '123',
      type: 'project',
      method: 'new',
      data: {}
    }
  }, {
    inputMessage: {
      id: '123',
      type: 'project',
      method: 'change',
      data: {
        likesGroup: [1, 2, 3]
      }
    },
    returnValue: (ret: any) => {
      expect(ret instanceof Observable).to.equal(true)

      const ret$: Observable<any> = ret

      ret$.subscribe((ops) => {
        expect(ops.length).to.equal(1)
        const op = ops[0]

        expect(op.kind).to.equal('upsert')
        expect(op.table).to.equal('Like')
        expect(op.row).to.deep.equal({ _id: '123:like', likesGroup: [1, 2, 3] })
      })
    }
  }, {
    inputMessage: {
      id: '123',
      type: 'task',
      method: 'change',
      data: {
        likesCount: 3,
        likesGroup: [1, 2, 3]
      }
    },
    returnValue: (ret: any) => {
      expect(ret instanceof Observable).to.equal(true)

      const ret$: Observable<any> = ret

      ret$.subscribe((ops) => {
        expect(ops.length).to.equal(2)

        const op1 = ops[0]

        expect(op1.kind).to.equal('upsert')
        expect(op1.table).to.equal('Like')
        expect(op1.row).to.deep.equal({ _id: '123:like', likesGroup: [1, 2, 3], likesCount: 3 })

        const op2 = ops[1]

        expect(op2.kind).to.equal('upsert')
        expect(op2.table).to.equal('Task')
        expect(op2.row).to.deep.equal({ _id: '123', likesGroup: [1, 2, 3], likesCount: 3 })
      })
    }
  }]

  it('redirectLike', () => {
    redirectLikeSamples().forEach(
      createTest(redirectLike, { mockDB: synchronousDB })
    )
  })
})
