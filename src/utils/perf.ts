import { Subject } from 'rxjs/Subject'

export interface PerfPacket {
  url: string
  method: string
  dur: number
  success: boolean
}

export const GlobalHttpPerf$ = new Subject<PerfPacket>()

const timeEnd = (label: string, data: object) => {
  if (!performance || !performance.mark || !performance.measure) {
    return
  }

  performance.mark(`${label}-end`)
  performance.measure(
    label,
    `${label}-start`,
    `${label}-end`
  )

  const measures = performance.getEntriesByName(label)
  const measure = measures[0]
  const dur = measure.duration

  // clear
  performance.clearMarks(`${label}-start`)
  performance.clearMarks(`${label}-end`)
  performance.clearMeasures(label)

  const perf = Object.assign({}, data, { dur }) as PerfPacket
  GlobalHttpPerf$.next(perf)
}

export const Perf = {
  time(data: Partial<PerfPacket> = {}) {
    if (!performance || !performance.mark || !performance.measure) {
      return () => void 0
    }

    // 生成一个随机的 key
    const label = Math.random().toString(36).slice(2)

    performance.mark(`${label}-start`)
    return (append: Partial<PerfPacket>) => timeEnd(label, { ...data, ...(append || {}) })
  }
}
