import { Observable } from 'rxjs/Observable'
import { Database } from './db'
import { Net, WebClient } from './Net'
import { forEach, isNonNullable } from './utils'
import { SDKFetch } from './SDKFetch'
import * as socket from './sockets'
import * as socketInterceptor from './sockets/interceptor'
import { schemaColl } from './schemas'
import {
  SchemaColl, Variables, GraphQLRequest, GraphQLResponse,
  GraphQLClientOption, GraphQLQuery, GraphQLVariables, GraphQLResult,
} from './utils/internalTypes'

export const schemas: SchemaColl = []

export { schemaColl }
export { CacheStrategy } from './Net'

export class SDK {
  private schemas = schemaColl.toArray()
  private graphQLClientOption: GraphQLClientOption | null = null

  net = new Net(this.schemas)
  fetch: SDKFetch

  socketClient: socket.Client
  database: Database | undefined
  socketProxy: socket.Proxy

  lift: typeof Net.prototype.lift = (ApiResult: any): any => {
    return this.net.lift(ApiResult)
  }

  constructor(
    webClientFactory?: new <T>() => WebClient<T>
  ) {
    this.fetch = new SDKFetch()
    if (webClientFactory) {
      this.fetch.setWebClientFactory(webClientFactory)
    }
    this.socketClient = new socket.Client(
      this.fetch,
      this.net,
      socket.mapMsgTypeToTable
    )
    this.socketProxy = this.socketClient.proxy
    this.socketClient.interceptors.append(socketInterceptor.redirectLike)
  }

  initReactiveDB (db: Database): Observable<void[]> {
    this.database = db
    forEach(this.schemas, d => {
      this.database!.defineSchema(d.name, d.schema)
    })
    this.database.connect()

    this.socketClient.initReactiveDB(this.database)

    return this.net.persist(this.database)
  }

  setGraphQLEndpoint(endpoint: string, requestOptions: GraphQLRequest = {}) {
    this.graphQLClientOption = {
      host: endpoint,
      headers: {
        ...requestOptions,
        ['Content-Type']: 'application/json'
      }
    }
  }

  graph<R extends object, V extends Variables = Variables, Q extends GraphQLQuery = string>(
    query: Q,
    variables: GraphQLVariables<Q, V>,
    withHeaders: true,
  ): Observable<GraphQLResult<Q, R> & { headers: Headers }>
  graph<R extends object, V extends Variables = Variables, Q extends GraphQLQuery = string>(
    query: Q,
    variables: GraphQLVariables<Q, V>,
    withHeaders: false,
  ): Observable<GraphQLResult<Q, R>>
  graph<R extends object, V extends Variables = Variables, Q extends GraphQLQuery = string>(
    query: Q,
    variables: GraphQLVariables<Q, V>,
  ): Observable<GraphQLResult<Q, R>>
  graph<R extends object, Q extends GraphQLQuery = string>(query: Q): Observable<GraphQLResult<Q, R>>
  graph<R extends object, V extends Variables = Variables, Q extends GraphQLQuery = string>(
    query: Q,
    variables?: GraphQLVariables<Q, V>,
    withHeaders: boolean = false,
  ) {
    if (!isNonNullable(this.graphQLClientOption)) {
      throw Error('GraphQL server should be specified.')
    }

    const requestBody = JSON.stringify({
      query,
      variables: variables ? variables : undefined,
    })

    return this.fetch
      .post<GraphQLResponse<R>>(
        this.graphQLClientOption.host,
        requestBody,
        { ...this.graphQLClientOption, includeHeaders: true }
      )
      .map(({ headers, body }) => {
        const { errors, data } = body
        if (errors) {
          const errmsg = errors.map(({ message }) => `${message}`)
          throw new Error(errmsg.join('\n'))
        }
        return withHeaders ? { ...(data! as any), headers } : data!
      })
  }

}
