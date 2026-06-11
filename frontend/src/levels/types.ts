import type { FieldSpec, StarSpec } from '../engine'

export interface Level {
  id: string
  title: string
  goal: string
  intro?: string
  fields: FieldSpec[]
  stars?: StarSpec
  allowedBlocks?: string[]
  hints?: string[]
}
