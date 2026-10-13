/* Marjinal daromad: asosiy misol kalkulyatori.
   Boshlang‘ich qiymatlar — manba taqdimoti: narx 100 000, birlik o‘zgaruvchan 60 000,
   doimiy 160 mln so‘m, sotuv 6 000 dona → foyda 80 mln. */
import { useState } from 'react'
import { fmt } from '../lib/format'
import { Icon } from '../lib/icons'
import { Frame } from './Frame'
import { useSlideCommands } from '../ai/bridge'
import s from './Slides.module.css'

type Key = 'p' | 'v' | 'q' | 'f'
interface Input {
  key: Key
  label: string
  unit: string
  step: number
  min: number
}
const INPUTS: Record<Key, Input> = {
  p: { key: 'p', label: 'Sotuv narxi', unit: 'so‘m/dona', step: 5_000, min: 0 },
  v: { key: 'v', label: 'Birlik o‘zgaruvchan xarajat', unit: 'so‘m/dona', step: 5_000, min: 0 },
  q: { key: 'q', label: 'Sotuv hajmi', unit: 'dona', step: 500, min: 0 },
  f: { key: 'f', label: 'Doimiy xarajat', unit: 'mln so‘m', step: 10, min: 0 },
}
const DEFAULTS: Record<Key, number> = { p: 100_000, v: 60_000, q: 6_000, f: 160 }

type Row = { kind: 'input'; key: Key; sign: '' | '−' | '×' } | { kind: 'total'; id: 'md' | 'tmd' | 'profit'; label: string; unit: string }

const ROWS: Row[] = [
  { kind: 'input', key: 'p', sign: '' },
  { kind: 'input', key: 'v', sign: '−' },
  { kind: 'total', id: 'md', label: 'Birlik marjinal daromad', unit: 'so‘m' },
  { kind: 'input', key: 'q', sign: '×' },
  { kind: 'total', id: 'tmd', label: 'Jami marjinal daromad', unit: 'mln so‘m' },
  { kind: 'input', key: 'f', sign: '−' },
  { kind: 'total', id: 'profit', label: 'Operatsion foyda', unit: 'mln so‘m' },
]

export function Margin() {
  const [v, setV] = useState(DEFAULTS)
  const bump = (k: Key, d: number) => setV((p) => ({ ...p, [k]: Math.max(INPUTS[k].min, p[k] + d) }))

  useSlideCommands('margin', (a) => {
    const nv = {
      p: typeof a.price === 'number' ? a.price : v.p,
      v: typeof a.variable_cost === 'number' ? a.variable_cost : v.v,
      q: typeof a.volume === 'number' ? a.volume : v.q,
      f: typeof a.fixed_cost_mln === 'number' ? a.fixed_cost_mln : v.f,
    }
    setV(nv)
    const umd = nv.p - nv.v
    const t = (umd * nv.q) / 1e6
    return {
      unit_md: umd,
      md_ratio_percent: nv.p > 0 ? (umd / nv.p) * 100 : 0,
      revenue_mln: (nv.p * nv.q) / 1e6,
      total_md_mln: t,
      fixed_mln: nv.f,
      operating_profit_mln: t - nv.f,
    }
  })

  const md = v.p - v.v
  const ratio = v.p > 0 ? md / v.p : 0
  const revenue = (v.p * v.q) / 1e6
  const tmd = (md * v.q) / 1e6
  const profit = tmd - v.f
  const totals = { md, tmd, profit }
  const max = Math.max(revenue, 1)

  const stages = [
    { no: '01', name: 'Sotuv tushumi', value: revenue, unit: 'mln so‘m', share: revenue / max },
    { no: '02', name: 'Jami marjinal daromad', value: tmd, unit: 'mln so‘m', share: tmd / max },
    { no: '03', name: 'Operatsion foyda', value: profit, unit: 'mln so‘m', share: Math.max(0, profit) / max },
  ]

  return (
    <Frame
      kicker="Marjinal daromad · Asosiy misol"
      title="Marjinal daromad — foydaning tayanch o‘lchovi"
      lead="Qiymatlarni o‘zgartiring: birlik MD, jami MD va operatsion foyda qanday shakllanishini kuzating."
    >
      <div className={s.colsFlow}>
        <div className={s.stack}>
          <div className={s.statement}>
            {ROWS.map((r) =>
              r.kind === 'input' ? (
                <div key={r.key} className={s.stRow}>
                  <span className={s.stSign}>{r.sign}</span>
                  <span>
                    {INPUTS[r.key].label} <small className={s.stUnit}>{INPUTS[r.key].unit}</small>
                  </span>
                  <span className={s.stepper}>
                    <button onClick={() => bump(r.key, -INPUTS[r.key].step)} aria-label={`${INPUTS[r.key].label}: kamaytirish`}>
                      <Icon id="minus" size={16} />
                    </button>
                    <output className={s.stOut}>{fmt(v[r.key])}</output>
                    <button onClick={() => bump(r.key, INPUTS[r.key].step)} aria-label={`${INPUTS[r.key].label}: oshirish`}>
                      <Icon id="plus" size={16} />
                    </button>
                  </span>
                </div>
              ) : (
                <div key={r.id} className={`${s.stRow} ${s.stTotal}`}>
                  <span className={s.stSign}>=</span>
                  <span>
                    {r.label} <small className={s.stUnit}>{r.unit}</small>
                  </span>
                  <span className={`${s.stValue} ${totals[r.id] < 0 ? s.neg : ''}`}>{fmt(totals[r.id])}</span>
                </div>
              ),
            )}
          </div>
          <div className={s.formulaStrip}>
            <span>
              <b>Birlik MD</b> = narx − birlik o‘zgaruvchan xarajat
            </span>
            <span>
              <b>Jami MD</b> = tushum − jami o‘zgaruvchan xarajat
            </span>
            <span>
              <b>Foyda</b> = jami MD − doimiy xarajat
            </span>
          </div>
        </div>

        <aside className={s.stages}>
          {stages.map((st) => (
            <div key={st.no} className={s.stage}>
              <span className={s.stageNo}>{st.no}</span>
              <span className={s.stageName}>{st.name}</span>
              <span className={`${s.stageValue} ${st.value < 0 ? s.neg : ''}`}>
                {fmt(st.value)} <small>{st.unit}</small>
              </span>
              <span className={s.stageBar} aria-hidden="true">
                <i style={{ width: `${Math.min(100, st.share * 100)}%` }} />
              </span>
            </div>
          ))}
          <div className={s.kpis2}>
            <div>
              <dt>MD koeffitsienti</dt>
              <dd>{fmt(ratio * 100, 1)} %</dd>
            </div>
            <div>
              <dt>Birlik MD</dt>
              <dd>
                {fmt(md)} <small>so‘m</small>
              </dd>
            </div>
          </div>
          <div className={s.stageReset}>
            <button className={s.ghostBtn} onClick={() => setV(DEFAULTS)}>
              Asosiy misolga qaytish
            </button>
          </div>
        </aside>
      </div>
    </Frame>
  )
}
