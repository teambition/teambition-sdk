export interface API<T> {
  readonly parse: (rawEvent: any) => T
  readonly parsePatch: (patch: any, target?: T) => Partial<T>
  readonly deparse: (parsed: T) => any
  readonly deparsePatch: (patch: any, target?: T) => Partial<T>
}
