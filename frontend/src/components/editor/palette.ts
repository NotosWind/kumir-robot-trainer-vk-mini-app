import type { Command, Direction, Predicate, Stmt } from '../../engine'

export interface PaletteCommand { kind: 'command'; cmd: Command; label: string }
export interface PaletteStructure { kind: 'structure'; id: 'while' | 'repeat' | 'if'; label: string }
export type PaletteItem = PaletteCommand | PaletteStructure

export const COMMAND_ITEMS: PaletteCommand[] = [
  { kind: 'command', cmd: 'вверх', label: 'вверх' },
  { kind: 'command', cmd: 'вниз', label: 'вниз' },
  { kind: 'command', cmd: 'влево', label: 'влево' },
  { kind: 'command', cmd: 'вправо', label: 'вправо' },
  { kind: 'command', cmd: 'закрасить', label: 'закрасить' },
]

export const STRUCTURE_ITEMS: PaletteStructure[] = [
  { kind: 'structure', id: 'while', label: 'нц пока' },
  { kind: 'structure', id: 'repeat', label: 'нц N раз' },
  { kind: 'structure', id: 'if', label: 'если' },
]

const DEFAULT_PRED: Predicate = { kind: 'free', dir: 'вправо' }

export function makeStmt(item: PaletteItem): Stmt {
  if (item.kind === 'command') return { kind: 'cmd', cmd: item.cmd }
  if (item.id === 'while') return { kind: 'whileLoop', cond: { kind: 'pred', pred: DEFAULT_PRED }, body: [] }
  if (item.id === 'repeat') return { kind: 'repeat', count: 3, body: [] }
  return { kind: 'if', cond: { kind: 'pred', pred: DEFAULT_PRED }, then: [] }
}

// Predicate choices for the condition selector (single-predicate MVP).
export interface PredChoice { label: string; pred: Predicate }
const dirs: { dir: Direction; word: string }[] = [
  { dir: 'влево', word: 'слева' }, { dir: 'вправо', word: 'справа' },
  { dir: 'вверх', word: 'сверху' }, { dir: 'вниз', word: 'снизу' },
]
export const PRED_CHOICES: PredChoice[] = [
  ...dirs.map((d) => ({ label: `${d.word} свободно`, pred: { kind: 'free', dir: d.dir } as Predicate })),
  ...dirs.map((d) => ({ label: `${d.word} стена`, pred: { kind: 'wall', dir: d.dir } as Predicate })),
  { label: 'клетка закрашена', pred: { kind: 'painted' } },
  { label: 'клетка чиста', pred: { kind: 'clear' } },
]

export function isAllowed(allowed: string[] | undefined, label: string): boolean {
  return !allowed || allowed.includes(label)
}
