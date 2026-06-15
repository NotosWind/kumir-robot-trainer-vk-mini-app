import type { CSSProperties } from 'react'
import type { CheckResult } from '../engine'

export interface ResultModalProps {
  result: CheckResult
  totalFields: number
  onContinue: () => void // solved → save progress and return to the map
  onClose: () => void // not solved → close and stay on the level to try again
}

function failureReason(result: CheckResult): string {
  const first = result.perField[0]
  if (first?.status === 'crash') {
    return 'Робот врезался в стену 🧱 и сломался — он не может шагнуть туда, где стена. Убери лишний шаг или поменяй направление.'
  }
  if (first?.status === 'looplimit') {
    return 'Робот зациклился 🔁 и не остановился. Посмотри на условие у «нц пока» — оно должно когда-то стать неверным.'
  }
  if (first && first.missing > 0 && first.extra === 0) {
    return `Закрашены не все нужные клетки — осталось пустыми: ${first.missing}.`
  }
  if (first && first.extra > 0 && first.missing === 0) {
    return `Закрашены лишние клетки: ${first.extra}. Закрашивай только нужные — заштрихованные — клетки.`
  }
  return 'Закрашены не те клетки. Сравни закрашенное с заштрихованными клетками-целью.'
}

export function ResultModal({ result, totalFields, onContinue, onClose }: ResultModalProps) {
  const solved = result.passedVisible
  const passed = result.perField.filter((p) => p.ok).length
  const stars = '⭐'.repeat(result.stars) + '☆'.repeat(3 - result.stars)

  return (
    <div role="dialog" aria-label="Результат" style={overlay}>
      <div style={card}>
        {solved ? (
          <>
            <div style={{ fontSize: 30 }}>{stars}</div>
            {result.passedAll && result.efficiency.withinLimit && result.efficiency.usedLoop && (
              <p>Отлично! Решено на всех полях, коротко и с циклом 🎉</p>
            )}
            {result.passedAll && result.efficiency.withinLimit && !result.efficiency.usedLoop && (
              <p>Отлично! Все клетки закрашены верно 🎉</p>
            )}
            {result.passedAll && !result.efficiency.withinLimit && (
              <p>Работает на всех полях! Чтобы получить третью звезду, реши короче — с циклом и без лишних команд.</p>
            )}
            {!result.passedAll && (
              <p>
                На этом поле получилось, но на других (другого размера или со стенами в других местах) — нет.
                Чтобы работало везде, не считай шаги вручную, а используй «нц пока … свободно».
              </p>
            )}
            {totalFields > 1 && <p style={small}>Проверено полей: {passed} из {totalFields}</p>}
            <button style={button} onClick={onContinue}>Продолжить</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 30 }}>😕</div>
            <p style={{ fontWeight: 700, margin: '6px 0' }}>Пока не получилось</p>
            <p>{failureReason(result)}</p>
            <button style={button} onClick={onClose}>Попробовать снова</button>
          </>
        )}
      </div>
    </div>
  )
}

const overlay: CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
}
const card: CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 24, textAlign: 'center', maxWidth: 340, width: '88%',
  lineHeight: 1.5,
}
const small: CSSProperties = { fontSize: 13, color: '#7a7a7a' }
const button: CSSProperties = {
  padding: '10px 18px', borderRadius: 12, border: 'none', color: '#fff',
  background: '#4bb34b', fontWeight: 700, cursor: 'pointer', marginTop: 8,
}
