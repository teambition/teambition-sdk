import { Observable } from 'rxjs/Observable'
import { Database } from 'reactivedb'
import { forEach } from '../utils'

export type SocketInterceptorFunc = (
  method: string,
  tableName: string,
  id: string,
  data: any,
  db: Database
) => Observable<any> | null

export class SocketInterceptor {

  private socketInterceptorFuncs: SocketInterceptorFunc[] = []

  use(func: SocketInterceptorFunc) {
    this.socketInterceptorFuncs.push(func)
  }

  do(method: string, tableName: string, id: string, data: any, db: Database) {
    let ret: Observable<any> | null = null
    forEach(this.socketInterceptorFuncs, (func: SocketInterceptorFunc) => {
      ret = func(method, tableName, id, data, db)
      if (ret) {
        return false
      }
      return null
    })
    return ret
  }
}
