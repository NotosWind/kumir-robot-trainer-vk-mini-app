import type { Cell } from '../engine'

export const row = (n: number, y = 0): Cell[] =>
  Array.from({ length: n }, (_, x) => ({ x, y }))

export const col = (n: number, x = 0): Cell[] =>
  Array.from({ length: n }, (_, y) => ({ x, y }))

export const rect = (x0: number, y0: number, w: number, h: number): Cell[] => {
  const out: Cell[] = []
  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) out.push({ x, y })
  }
  return out
}

/** Border cells of a cols×rows grid (duplicates at corners are fine — consumers use sets). */
export const perimeter = (cols: number, rows: number): Cell[] => {
  const out: Cell[] = []
  for (let x = 0; x < cols; x += 1) { out.push({ x, y: 0 }); out.push({ x, y: rows - 1 }) }
  for (let y = 0; y < rows; y += 1) { out.push({ x: 0, y }); out.push({ x: cols - 1, y }) }
  return out
}
