/* Zararsizlik nuqtasi: tushum–xarajat va foyda–hajm grafiklari (interaktiv).
   Asosiy misol: P = 100 000, v = 60 000, F = 160 mln → Q₀ = 4 000 dona, 400 mln so‘m. */
import { useRef, useState } from 'react'
import { fmt } from '../lib/format'
import { Frame, Seg } from './Frame'
import { useSlideCommands } from '../ai/bridge'
import s from './Slides.module.css'

const P = 100_000
const V = 60_000
const F = 160 // mln
const MD = P - V
const Q0 = (F * 1e6) / MD // 4 000
const X_MAX = 8_000

type View = 'cvp' | 'pv'
const VIEWS: { id: View; label: string }[] = [
  { id: 'cvp', label: 'Tushum va xarajat' },
  { id: 'pv', label: 'Foyda–hajm' },
]

const CH = { w: 820, h: 470, l: 86, r: 26, t: 22, b: 58 }
const PW = CH.w - CH.l - CH.r
const PH = CH.h - CH.t - CH.b
const px = (x: number) => CH.l + (x / X_MAX) * PW

const revenue = (q: number) => (P * q) / 1e6
const cost = (q: number) => F + (V * q) / 1e6
const profit = (q: number) => revenue(q) - cost(q)

export function Breakeven() {
  const [view, setView] = useState<View>('cvp')
  const [q, setQ] = useState(6_000)
  const svgRef = useRef<SVGSVGElement>(null)

  useSlideCommands('breakeven', (a) => {
    const vol = typeof a.volume === 'number' ? Math.max(0, Math.min(X_MAX, Math.round(a.volume))) : q
    if (typeof a.volume === 'number') setQ(vol)
    if (a.view === 'cvp' || a.view === 'pv') setView(a.view)
    const p = profit(vol)
    return {
      volume_units: vol,
      revenue_mln: revenue(vol),
      total_cost_mln: cost(vol),
      profit_mln: p,
      zone: p < 0 ? 'zarar' : p === 0 ? 'zararsizlik' : 'foyda',
      breakeven_units: Q0,
      breakeven_sales_mln: revenue(Q0),
    }
  })

  const yMin = view === 'cvp' ? 0 : -200
  const yMax = view === 'cvp' ? 900 : 200
  const py = (y: number) => CH.t + PH - ((y - yMin) / (yMax - yMin)) * PH
  const ticks = view === 'cvp' ? [0, 100, 200, 300, 400, 500, 600, 700, 800, 900] : [-200, -150, -100, -50, 0, 50, 100, 150, 200]

  const onPointer = (e: React.PointerEvent) => {
    const box = svgRef.current?.getBoundingClientRect()
    if (!box) return
    const vx = ((e.clientX - box.left) / box.width) * CH.w
    const raw = ((vx - CH.l) / PW) * X_MAX
    setQ(Math.max(0, Math.min(X_MAX, Math.round(raw / 100) * 100)))
  }

  const pr = profit(q)
  const state = Math.abs(pr) < 0.5 ? 'zero' : pr < 0 ? 'loss' : 'gain'
  const stateText = { zero: 'Zararsizlik nuqtasi', loss: 'Zarar zonasi', gain: 'Foyda zonasi' }[state]

  return (
    <Frame
      kicker="Zararsizlik · Interaktiv grafik"
      title="Zararsizlik nuqtasi zarar va foyda zonalarini ajratadi"
      lead="Hajmni suring: tushum va jami xarajat qayerda tenglashadi, foyda qaysi tezlikda o‘sadi."
    >
      <div className={s.colsSim}>
        <svg
          ref={svgRef}
          className={`${s.chart} ${s.chartLive}`}
          viewBox={`0 0 ${CH.w} ${CH.h}`}
          role="img"
          aria-label={`${view === 'cvp' ? 'Tushum va jami xarajat' : 'Foyda–hajm'} grafigi: ${fmt(q)} donada foyda ${fmt(pr)} mln so‘m`}
          onPointerMove={onPointer}
          onPointerDown={onPointer}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line className={t === 0 ? s.axis : s.gridLine} x1={CH.l} x2={CH.w - CH.r} y1={py(t)} y2={py(t)} />
              <text className={s.tickText} x={CH.l - 12} y={py(t) + 5} textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          {[0, 2_000, 4_000, 6_000, 8_000].map((t) => (
            <text key={t} className={s.tickText} x={px(t)} y={CH.h - CH.b + 26} textAnchor="middle">
              {fmt(t)}
            </text>
          ))}
          <text className={s.axisTitle} x={CH.l} y={12}>
            {view === 'cvp' ? 'Tushum va xarajat, mln so‘m' : 'Foyda, mln so‘m'}
          </text>
          <text className={s.axisTitle} x={CH.w - CH.r} y={CH.h - 8} textAnchor="end">
            Sotuv hajmi, dona
          </text>

          {view === 'cvp' ? (
            <g key="cvp">
              {/* zonalar: zarar — tushum va xarajat orasida, chapda; foyda — o‘ngda */}
              <path
                className={s.zoneLoss}
                d={`M${px(0)},${py(revenue(0))} L${px(Q0)},${py(revenue(Q0))} L${px(0)},${py(cost(0))} Z`}
              />
              <path
                className={s.zoneGain}
                d={`M${px(Q0)},${py(revenue(Q0))} L${px(X_MAX)},${py(revenue(X_MAX))} L${px(X_MAX)},${py(cost(X_MAX))} Z`}
              />
              <line className={s.guide} x1={px(0)} x2={px(X_MAX)} y1={py(F)} y2={py(F)} />
              <text className={s.guideText} x={px(X_MAX) - 6} y={py(F) - 8} textAnchor="end">
                Doimiy xarajat: {F} mln
              </text>
              <path className={s.seriesAlt} d={`M${px(0)},${py(cost(0))} L${px(X_MAX)},${py(cost(X_MAX))}`} />
              <path className={s.series} d={`M${px(0)},${py(revenue(0))} L${px(X_MAX)},${py(revenue(X_MAX))}`} />
              <text className={s.seriesLabel} x={px(X_MAX) - 8} y={py(revenue(X_MAX)) - 12} textAnchor="end">
                Sotuv tushumi
              </text>
              <text className={s.seriesLabelAlt} x={px(X_MAX) - 8} y={py(cost(X_MAX)) + 26} textAnchor="end">
                Jami xarajat
              </text>
              <text className={s.zoneText} x={px(1_300)} y={py(230)}>
                Zarar
              </text>
              <text className={s.zoneText} x={px(6_700)} y={py(660)}>
                Foyda
              </text>
              {/* zararsizlik nuqtasi */}
              <line className={s.cross} x1={px(Q0)} x2={px(Q0)} y1={py(revenue(Q0))} y2={py(0)} />
              <circle className={s.markerBep} cx={px(Q0)} cy={py(revenue(Q0))} r="8" />
              <text className={s.guideText} x={px(Q0) - 12} y={py(revenue(Q0)) - 16} textAnchor="end">
                Q₀ = {fmt(Q0)} dona · {fmt(revenue(Q0))} mln
              </text>
              <line className={s.cross} x1={px(q)} x2={px(q)} y1={py(Math.max(revenue(q), cost(q)))} y2={py(0)} />
              <circle className={s.marker} cx={px(q)} cy={py(revenue(q))} r="7" />
              <circle className={s.markerAlt} cx={px(q)} cy={py(cost(q))} r="7" />
            </g>
          ) : (
            <g key="pv">
              <path className={s.zoneLoss} d={`M${px(0)},${py(0)} L${px(Q0)},${py(0)} L${px(0)},${py(profit(0))} Z`} />
              <path className={s.zoneGain} d={`M${px(Q0)},${py(0)} L${px(X_MAX)},${py(0)} L${px(X_MAX)},${py(profit(X_MAX))} Z`} />
              <path className={s.series} d={`M${px(0)},${py(profit(0))} L${px(X_MAX)},${py(profit(X_MAX))}`} />
              <text className={s.zoneText} x={px(900)} y={py(-110)}>
                Zarar
              </text>
              <text className={s.zoneText} x={px(6_300)} y={py(60)}>
                Foyda
              </text>
              <text className={s.guideText} x={px(1_100)} y={py(-175)}>
                Hajm nol: foyda = −F = −{F} mln
              </text>
              <circle className={s.markerBep} cx={px(Q0)} cy={py(0)} r="8" />
              <text className={s.guideText} x={px(Q0) + 16} y={py(0) + 26}>
                Q₀ = {fmt(Q0)} dona
              </text>
              <line className={s.cross} x1={px(q)} x2={px(q)} y1={py(pr)} y2={py(0)} />
              <circle className={s.marker} cx={px(q)} cy={py(pr)} r="7" />
            </g>
          )}
        </svg>

        <aside className={s.simSide}>
          <Seg label="Grafik turi" options={VIEWS} value={view} onChange={setView} />
          <div className={s.formulaRow}>
            <strong>Q₀</strong>
            <span>
              Doimiy xarajat ÷ Birlik MD = 160 mln ÷ 40 000 = <b>4 000 dona</b>; qiymatda 160 mln ÷ 40 % = <b>400 mln so‘m</b>
            </span>
          </div>
          <label className={s.sliderRow}>
            <span className={s.label}>Sotuv hajmi</span>
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
              <dt>Tushum</dt>
              <dd>
                {fmt(revenue(q))} <small>mln</small>
              </dd>
            </div>
            <div>
              <dt>Jami xarajat</dt>
              <dd>
                {fmt(cost(q))} <small>mln</small>
              </dd>
            </div>
            <div>
              <dt>Foyda</dt>
              <dd className={pr < 0 ? s.neg : ''}>
                {fmt(pr)} <small>mln</small>
              </dd>
            </div>
          </dl>
          <div className={`${s.stateBadge} ${s[`state_${state}`]}`}>
            <span>{fmt(q)} dona</span>
            <b>{stateText}</b>
          </div>
          <p className={s.insight}>
            <b>Qaror</b>
            Hajmning har 1 donaga o‘sishi foydani birlik MD — 40 000 so‘mga oshiradi. 4 000 dona chapida zarar, o‘ngida foyda zonasi.
          </p>
        </aside>
      </div>
    </Frame>
  )
}
