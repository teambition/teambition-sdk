export interface API<T> {

  /**
   * 将后端提供的数据解析为前端对应数据模型（model: T）。
   */
  readonly parse: (response: any) => T

  /**
   * 将后端提供的更新数据解析为前端对应数据模型（model: T）上部分字段的更新数据。
   */
  readonly parsePatch: (patchResponse: any, model?: T) => Partial<T>

  /**
   * 将前端生成的数据模型（model: T）反解析为后端需要的数据。
   */
  readonly deparse: (model: T) => any

  /**
   * 将前端生成的数据模型（model: T）上的更新数据反解析为后端需要的更新数据。
   */
  readonly deparsePatch: (patchModel: Partial<T>, model?: T) => any

}
