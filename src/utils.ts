export const forEach = (target: any, eachFunc: (val: any, key: any) => any) => {
  let length: number
  if (target instanceof Array) {
    length = target.length
    for (let i = 0; i < length; i++) {
      eachFunc(target[i], i)
    }
  }else {
    const keys = Object.keys(target)
    let key: string
    length = keys.length
    for (let i = 0; i < length; i ++) {
      key = keys[i]
      eachFunc(target[key], key)
    }
  }
}

export const assign = (target: any, origin: any) => {
  forEach(origin, (val: any, key: string) => {
    target[key] = origin[key]
  })
  return target
}
