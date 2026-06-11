import './FieldView.css'
import { key } from '../../engine'
import type { Cell, FieldSpec } from '../../engine'

const S = 36 // cell size in px

export interface FieldViewProps {
  field: FieldSpec
  robot: Cell
  painted: Set<string>
  crashAt?: Cell
}

export function FieldView({ field, robot, painted, crashAt }: FieldViewProps) {
  const { cols, rows, walls, target } = field
  const w = cols * S
  const h = rows * S
  const targetSet = new Set(target.map((c) => key(c.x, c.y)))

  const cells = []
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const k = key(x, y)
      const cls = painted.has(k) ? 'cell painted' : targetSet.has(k) ? 'cell target' : 'cell'
      cells.push(<rect key={k} className={cls} x={x * S} y={y * S} width={S} height={S} />)
    }
  }

  const wallLines = walls.map((wkey) => {
    const [type, xs, ys] = wkey.split(':')
    const x = Number(xs)
    const y = Number(ys)
    if (type === 'V') {
      const px = (x + 1) * S
      return <line key={wkey} className="wall" x1={px} y1={y * S} x2={px} y2={(y + 1) * S} />
    }
    const py = (y + 1) * S
    return <line key={wkey} className="wall" x1={x * S} y1={py} x2={(x + 1) * S} y2={py} />
  })

  return (
    <svg className="field-svg" viewBox={`-2 -2 ${w + 4} ${h + 4}`} role="img" aria-label="Поле робота">
      <defs>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#fff" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#cfe0f3" strokeWidth="4" />
        </pattern>
      </defs>
      {cells}
      {crashAt && <rect className="crash" x={crashAt.x * S} y={crashAt.y * S} width={S} height={S} />}
      {wallLines}
      <rect className="border" x={0} y={0} width={w} height={h} />
      <g data-testid="robot" transform={`translate(${robot.x * S + S / 2}, ${robot.y * S + S / 2})`}>
        <circle r={S * 0.32} fill="#4a8fe7" />
        <circle cx={-5} cy={-3} r={2.5} fill="#fff" />
        <circle cx={5} cy={-3} r={2.5} fill="#fff" />
      </g>
    </svg>
  )
}
