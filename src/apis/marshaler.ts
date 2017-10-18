export interface Marshaler<T> {

  /**
   * 将后端提供的数据解析为前端对应数据模型（model: T）。
   */
  readonly parse: (response: Readonly<any>) => T

  /**
   * 将后端提供的更新数据解析为前端对应数据模型（model: T）上部分字段的更新数据。
   */
  readonly parsePatch: (patchResponse: Readonly<any>, model?: Readonly<T>) => Partial<T>

  /**
   * 将前端生成的数据模型（model: T）反解析为后端需要的数据。
   */
  readonly deparse: (model: Readonly<T>) => any

  /**
   * 将前端生成的数据模型（model: T）上的更新数据反解析为后端需要的更新数据。
   */
  readonly deparsePatch: (patchModel: Readonly<Partial<T>>, model?: Readonly<T>) => any

}
