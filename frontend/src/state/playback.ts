import { key } from '../engine'
import type { Cell, FieldSpec, Frame } from '../engine'

export interface PlaybackState {
  robot: Cell
  painted: Set<string>
  crashAt?: Cell
}

export function stateAtFrame(field: FieldSpec, frames: Frame[], index: number): PlaybackState {
  const painted = new Set<string>((field.prePainted ?? []).map((c) => key(c.x, c.y)))
  let robot: Cell = { ...field.robot }
  let crashAt: Cell | undefined

  for (let i = 0; i <= index && i < frames.length; i += 1) {
    const f = frames[i]
    robot = { ...f.robot }
    if (f.action === 'paint' && f.paintedCell) painted.add(key(f.paintedCell.x, f.paintedCell.y))
    if (f.action === 'crash') crashAt = { ...f.robot }
  }

  return { robot, painted, crashAt }
}
