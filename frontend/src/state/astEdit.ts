import type { Condition, Program, Stmt } from '../engine'

/** Returns the child statement array that `path` points into. */
function bodyAt(body: Stmt[], path: number[]): Stmt[] {
  let arr = body
  for (const idx of path) {
    const node = arr[idx]
    if (node.kind === 'whileLoop' || node.kind === 'repeat') arr = node.body
    else if (node.kind === 'if') arr = node.then
    else throw new Error('path points into a non-container statement')
  }
  return arr
}

/** Structurally clone the body arrays along `path` so edits stay immutable. */
function cloneAlong(body: Stmt[], path: number[]): Stmt[] {
  if (path.length === 0) return [...body]
  const [head, ...rest] = path
  return body.map((s, i) => {
    if (i !== head) return s
    if (s.kind === 'whileLoop' || s.kind === 'repeat') return { ...s, body: cloneAlong(s.body, rest) }
    if (s.kind === 'if') return { ...s, then: cloneAlong(s.then, rest) }
    return s
  })
}

export function appendStmt(program: Program, path: number[], stmt: Stmt): Program {
  const body = cloneAlong(program.body, path)
  bodyAt(body, path).push(stmt)
  return { body }
}

export function removeAt(program: Program, path: number[]): Program {
  const parent = path.slice(0, -1)
  const idx = path[path.length - 1]
  const body = cloneAlong(program.body, parent)
  bodyAt(body, parent).splice(idx, 1)
  return { body }
}

export function setCondition(program: Program, path: number[], cond: Condition): Program {
  const parent = path.slice(0, -1)
  const idx = path[path.length - 1]
  const body = cloneAlong(program.body, parent)
  const arr = bodyAt(body, parent)
  const node = arr[idx]
  if (node.kind === 'whileLoop') arr[idx] = { ...node, cond }
  else if (node.kind === 'if') arr[idx] = { ...node, cond }
  return { body }
}

export function setCount(program: Program, path: number[], count: number): Program {
  const parent = path.slice(0, -1)
  const idx = path[path.length - 1]
  const body = cloneAlong(program.body, parent)
  const arr = bodyAt(body, parent)
  const node = arr[idx]
  if (node.kind === 'repeat') arr[idx] = { ...node, count }
  return { body }
}
