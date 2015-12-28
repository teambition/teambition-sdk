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

export const clone = (target: any, origin: any) => {
  if (!origin || typeof origin !== 'object') {
    return
  }
  if (typeof target === 'object') {
    forEach(origin, (val: any, key: string) => {
      if (typeof val === 'object') {
        target[key] = clone({}, val)
      }
      if (val) {
        target[key] = val
      }
    })
    return target
  }else {
    console.error('Type error, clone target mush be an Object')
    return
  }
}

const s4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

let uuidStack = []

export const uuid = () => {
  let UUID = s4() + s4()
  while (uuidStack.indexOf(UUID) !== -1) {
    UUID = s4() + s4()
  }
  uuidStack.push(UUID)
  return UUID
}
