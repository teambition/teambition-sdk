import { Observable } from 'rxjs/Observable'

export abstract class Network<T> {
  protected abstract get params(): any
  protected abstract setParams(...args: any): this
  protected abstract prepareRequest(...args: any): this
  public abstract send(): Observable<T>
}
