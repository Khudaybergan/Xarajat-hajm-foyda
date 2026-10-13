/* Xarajat xulqi: aralash xarajatni ajratish — yuqori-past usuli (interaktiv model).
   Manba raqamlari: yuqori nuqta 8 000 dona / 520 mln, past nuqta 4 000 dona / 320 mln. */
import { useRef, useState } from 'react'
import { fmt } from '../lib/format'
import { Frame } from './Frame'
import { useSlideCommands } from '../ai/bridge'
import s from './Slides.module.css'

const HI = { q: 8_000, y: 520 } // mln so‘m
const LO = { q: 4_000, y: 320 }
const B = ((HI.y - LO.y) * 1e6) / (HI.q - LO.q) // so‘m/dona → 50 000
const A = HI.y - (B * HI.q) / 1e6 // mln → 120
const X_MAX = 10_000
const Y_MAX = 700

const CH = { w: 820, h: 470, l: 86, r: 26, t: 22, b: 58 }
const PW = CH.w - CH.l - CH.r
const PH = CH.h - CH.t - CH.b
const px = (x: number) => CH.l + (x / X_MAX) * PW
const py = (y: number) => CH.t + PH - (y / Y_MAX) * PH
const total = (q: number) => A + (B * q) / 1e6

const BEHAVIOR = [
  { kind: 'O‘zgaruvchan', total: 'Jami — hajmga mutanosib', unit: 'Birlikka — relevant diapazonda doimiy' },
  { kind: 'Doimiy', total: 'Jami — relevant diapazonda doimiy', unit: 'Birlikka — hajm oshsa kamayadi' },
]

export function HighLow() {
  const [q, setQ] = useState(6_000)
  const svgRef = useRef<SVGSVGElement>(null)

  useSlideCommands('highlow', (a) => {
    const vol = typeof a.volume === 'number' ? Math.max(0, Math.min(X_MAX, Math.round(a.volume))) : q
    setQ(vol)
    return { volume_units: vol, total_cost_mln: total(vol), fixed_mln: A, variable_per_unit: B, cost_per_unit: vol > 0 ? (total(vol) * 1e6) / vol : null }
  })
  const y = total(q)
  const perUnit = q > 0 ? (y * 1e6) / q : null

  const onPointer = (e: React.PointerEvent) => {
    const box = svgRef.current?.getBoundingClientRect()
    if (!box) return
    const vx = ((e.clientX - box.left) / box.width) * CH.w
    const raw = ((vx - CH.l) / PW) * X_MAX
    setQ(Math.max(0, Math.min(X_MAX, Math.round(raw / 100) * 100)))
  }

  return (
    <Frame
      kicker="Xarajat xulqi · Yuqori-past usuli"
      title="Aralash xarajatni ajratish modelni tozalaydi"
      lead="Jami xarajat Y = a + bX. Ikki kuzatuv nuqtasi orqali doimiy (a) va birlik o‘zgaruvchan (b) qismlar topiladi."
    >
      <div className={s.colsSim}>
        <svg
          ref={svgRef}
          className={`${s.chart} ${s.chartLive}`}
          viewBox={`0 0 ${CH.w} ${CH.h}`}
          role="img"
          aria-label={`Jami xarajat funksiyasi: hajm ${fmt(q)} dona bo‘lganda ${fmt(y)} mln so‘m`}
          onPointerMove={onPointer}
          onPointerDown={onPointer}
        >
          {[0, 100, 200, 300, 400, 500, 600, 700].map((t) => (
            <g key={t}>
              <line className={t === 0 ? s.axis : s.gridLine} x1={CH.l} x2={CH.w - CH.r} y1={py(t)} y2={py(t)} />
              <text className={s.tickText} x={CH.l - 12} y={py(t) + 5} textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          {[0, 2_000, 4_000, 6_000, 8_000, 10_000].map((t) => (
            <text key={t} className={s.tickText} x={px(t)} y={CH.h - CH.b + 26} textAnchor="middle">
              {fmt(t)}
            </text>
          ))}
          <text className={s.axisTitle} x={CH.l} y={12}>
            Jami xarajat, mln so‘m
          </text>
          <text className={s.axisTitle} x={CH.w - CH.r} y={CH.h - 8} textAnchor="end">
            Faoliyat hajmi, dona
          </text>

          {/* doimiy qism */}
          <rect className={s.zoneFixed} x={px(0)} y={py(A)} width={PW} height={py(0) - py(A)} />
          <line className={s.guide} x1={px(0)} x2={px(X_MAX)} y1={py(A)} y2={py(A)} />
          <text className={s.guideText} x={px(X_MAX) - 6} y={py(A) + 20} textAnchor="end">
            Doimiy qism: a = {fmt(A)} mln
          </text>
          <text className={s.guideText} x={px(600)} y={py(total(600)) - 18}>
            O‘zgaruvchan qism: bX
          </text>

          <path className={s.series} d={`M${px(0)},${py(total(0))} L${px(X_MAX)},${py(total(X_MAX))}`} />

          {/* kuzatuv nuqtalari */}
          {[LO, HI].map((p, i) => (
            <g key={i}>
              <circle className={s.markerHollow} cx={px(p.q)} cy={py(p.y)} r="8" />
              <text className={s.guideText} x={px(p.q) + 14} y={py(p.y) - 12}>
                {i === 0 ? 'Past' : 'Yuqori'} nuqta: {fmt(p.q)} dona · {p.y} mln
              </text>
            </g>
          ))}

          {/* joriy nuqta */}
          <line className={s.cross} x1={px(q)} x2={px(q)} y1={py(y)} y2={py(0)} />
          <line className={s.cross} x1={px(0)} x2={px(q)} y1={py(y)} y2={py(y)} />
          <circle className={s.marker} cx={px(q)} cy={py(y)} r="7" />
        </svg>

        <aside className={s.simSide}>
          <div className={s.formulaRow}>
            <strong>b</strong>
            <span>
              (520 − 320) mln ÷ (8 000 − 4 000) = <b>{fmt(B)} so‘m</b> birlikka o‘zgaruvchan xarajat
            </span>
          </div>
          <div className={s.formulaRow}>
            <strong>a</strong>
            <span>
              520 mln − 50 000 × 8 000 = <b>{fmt(A)} mln</b> doimiy xarajat
            </span>
          </div>
          <div className={s.formulaRow}>
            <strong>Y</strong>
            <span>
              Y = {fmt(A)} mln + {fmt(B)} × X
            </span>
          </div>
          <label className={s.sliderRow}>
            <span className={s.label}>Faoliyat hajmi</span>
            <input
              type="range"
              min={0}
              max={X_MAX}
              step={100}
              value={q}
              onChange={(e) => setQ(Number(e.target.value))}
              aria-valuetext={`${fmt(q)} dona`}
            />
          </label>
          <dl className={s.kpis}>
            <div>
              <dt>Hajm</dt>
              <dd>
                {fmt(q)} <small>dona</small>
              </dd>
            </div>
            <div>
              <dt>Jami xarajat</dt>
              <dd>
                {fmt(y)} <small>mln</small>
              </dd>
            </div>
            <div>
              <dt>Birlikka xarajat</dt>
              <dd>
                {perUnit === null ? '—' : fmt(perUnit)} <small>so‘m</small>
              </dd>
            </div>
          </dl>
          <ul className={s.behaviorList}>
            {BEHAVIOR.map((b) => (
              <li key={b.kind}>
                <b>{b.kind}</b>
                <span>{b.total}</span>
                <span>{b.unit}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Frame>
  )
}
