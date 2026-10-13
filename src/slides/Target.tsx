/* Maqsadli foyda: operatsion va sof foyda uchun zarur hajm (interaktiv).
   Asosiy misol: F = 160 mln, MD = 40 000, maqsadli foyda 120 mln → 7 000 dona;
   sof foyda 96 mln, soliq 20 % → 120 mln → 7 000 dona. */
import { useState } from 'react'
import { fmt } from '../lib/format'
import { Icon } from '../lib/icons'
import { Frame, Seg } from './Frame'
import { useSlideCommands } from '../ai/bridge'
import s from './Slides.module.css'

const F = 160 // mln
const MD = 40_000
const RATIO = 0.4

type Mode = 'op' | 'net'
const MODES: { id: Mode; label: string }[] = [
  { id: 'op', label: 'Operatsion foyda' },
  { id: 'net', label: 'Sof foyda' },
]

export function Target() {
  const [mode, setMode] = useState<Mode>('op')
  const [target, setTarget] = useState(120) // mln
  const [tax, setTax] = useState(20) // %

  useSlideCommands('target', (a) => {
    const m: Mode = a.mode === 'net' ? 'net' : a.mode === 'op' ? 'op' : mode
    const tg = typeof a.target_mln === 'number' ? Math.max(0, Math.min(300, a.target_mln)) : target
    const tx = typeof a.tax_percent === 'number' ? Math.max(0, Math.min(50, a.tax_percent)) : tax
    setMode(m)
    setTarget(tg)
    setTax(tx)
    const pre = m === 'op' ? tg : tg / (1 - tx / 100)
    const qq = ((F + pre) * 1e6) / MD
    return { mode: m, target_mln: tg, tax_percent: tx, pretax_profit_mln: pre, required_units: qq, required_sales_mln: (F + pre) / RATIO }
  })

  const pretax = mode === 'op' ? target : target / (1 - tax / 100)
  const q = ((F + pretax) * 1e6) / MD
  const sales = (F + pretax) / RATIO

  const steps =
    mode === 'op'
      ? [
          { no: '01', name: 'Doimiy xarajat + maqsadli foyda', value: `${fmt(F)} + ${fmt(target)} = ${fmt(F + target)} mln` },
          { no: '02', name: 'Birlik MDga bo‘lamiz', value: `${fmt(F + target)} mln ÷ ${fmt(MD)} = ${fmt(q)} dona` },
          { no: '03', name: 'Sotuv qiymati', value: `${fmt(F + target)} mln ÷ ${RATIO * 100} % = ${fmt(sales)} mln so‘m` },
        ]
      : [
          { no: '01', name: 'Sof foyda → soliqdan oldingi foyda', value: `${fmt(target)} ÷ (1 − ${tax / 100}) = ${fmt(pretax, 1)} mln` },
          { no: '02', name: 'Doimiy xarajat + soliqdan oldingi foyda', value: `${fmt(F)} + ${fmt(pretax, 1)} = ${fmt(F + pretax, 1)} mln` },
          { no: '03', name: 'Birlik MDga bo‘lamiz', value: `${fmt(F + pretax, 1)} mln ÷ ${fmt(MD)} = ${fmt(q)} dona` },
        ]

  return (
    <Frame
      kicker="Maqsadli foyda · Kalkulyator"
      title="Maqsadli foyda sotuv hajmini oldindan belgilaydi"
      lead="Zararsizlik formulasiga maqsadli foyda qo‘shiladi. Sof foyda avval soliqdan oldingi foydaga aylantiriladi."
    >
      <div className={s.colsTarget}>
        <div className={s.stack}>
          <Seg label="Foyda turi" options={MODES} value={mode} onChange={setMode} />
          <div className={s.formulaBig}>
            {mode === 'op' ? (
              <>
                Q = (Doimiy xarajat + Maqsadli foyda) ÷ Birlik MD
              </>
            ) : (
              <>
                Soliqdan oldingi foyda = Sof foyda ÷ (1 − soliq stavkasi)
              </>
            )}
          </div>
          <label className={s.sliderRow}>
            <span className={s.label}>
              {mode === 'op' ? 'Maqsadli operatsion foyda' : 'Maqsadli sof foyda'} — <b>{fmt(target)} mln so‘m</b>
            </span>
            <input type="range" min={0} max={300} step={4} value={target} onChange={(e) => setTarget(Number(e.target.value))} />
          </label>
          {mode === 'net' && (
            <label className={s.sliderRow}>
              <span className={s.label}>
                Foyda solig‘i stavkasi — <b>{tax} %</b>
              </span>
              <input type="range" min={0} max={50} step={1} value={tax} onChange={(e) => setTax(Number(e.target.value))} />
            </label>
          )}
          <ol className={s.calcSteps}>
            {steps.map((st) => (
              <li key={st.no}>
                <span className={s.stageNo}>{st.no}</span>
                <span className={s.calcName}>{st.name}</span>
                <span className={s.calcValue}>{st.value}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className={s.readout}>
          <p className={s.label}>Zarur sotuv hajmi</p>
          <p className={s.bigNum}>
            {fmt(q)} <small>dona</small>
          </p>
          <div className={s.share} aria-hidden="true">
            <i style={{ width: `${Math.min(100, (q / 12_000) * 100)}%` }} />
          </div>
          <p className={s.readoutNote}>
            Sotuv qiymatida — <b>{fmt(sales, 0)} mln so‘m</b>. Zararsizlikdan <b>{fmt(q - 4_000)} dona</b> yuqori.
          </p>
          <ul className={s.miniList}>
            <li>
              <Icon id="check" size={16} />
              Doimiy xarajat 160 mln, birlik MD 40 000 so‘m
            </li>
            <li>
              <Icon id="check" size={16} />
              Asosiy misol: 120 mln operatsion foyda → 7 000 dona
            </li>
            <li>
              <Icon id="check" size={16} />
              96 mln sof foyda, 20 % soliq → 120 mln → 7 000 dona
            </li>
          </ul>
        </aside>
      </div>
    </Frame>
  )
}
