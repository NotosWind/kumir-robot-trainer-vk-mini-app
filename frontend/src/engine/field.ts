import type { Direction } from './ast'

export interface Cell {
  x: number
  y: number
}

export interface FieldSpec {
  cols: number
  rows: number
  robot: Cell
  walls: string[]          // canonical "V:x:y" / "H:x:y" keys
  prePainted?: Cell[]
  target: Cell[]
}

export function key(x: number, y: number): string {
  return `${x}:${y}`
}

export class Field {
  readonly cols: number
  readonly rows: number
  robot: Cell
  private readonly walls: Set<string>
  private readonly painted: Set<string>

  constructor(spec: FieldSpec) {
    this.cols = spec.cols
    this.rows = spec.rows
    this.robot = { ...spec.robot }
    this.walls = new Set(spec.walls)
    this.painted = new Set((spec.prePainted ?? []).map((c) => key(c.x, c.y)))
  }

  /** True if the robot can move one step in `dir` (in bounds and no wall on that edge). */
  free(dir: Direction): boolean {
    const { x, y } = this.robot
    switch (dir) {
      case 'вправо':
        return x + 1 < this.cols && !this.walls.has(`V:${x}:${y}`)
      case 'влево':
        return x - 1 >= 0 && !this.walls.has(`V:${x - 1}:${y}`)
      case 'вниз':
        return y + 1 < this.rows && !this.walls.has(`H:${x}:${y}`)
      case 'вверх':
        return y - 1 >= 0 && !this.walls.has(`H:${x}:${y - 1}`)
    }
  }

  /** Attempts to move; returns false (without moving) if blocked. */
  move(dir: Direction): boolean {
    if (!this.free(dir)) return false
    switch (dir) {
      case 'вправо': this.robot = { x: this.robot.x + 1, y: this.robot.y }; break
      case 'влево':  this.robot = { x: this.robot.x - 1, y: this.robot.y }; break
      case 'вниз':   this.robot = { x: this.robot.x, y: this.robot.y + 1 }; break
      case 'вверх':  this.robot = { x: this.robot.x, y: this.robot.y - 1 }; break
    }
    return true
  }

  paint(): void {
    this.painted.add(key(this.robot.x, this.robot.y))
  }

  isPainted(): boolean {
    return this.painted.has(key(this.robot.x, this.robot.y))
  }

  isClear(): boolean {
    return !this.isPainted()
  }

  paintedKeys(): string[] {
    return [...this.painted]
  }
}
