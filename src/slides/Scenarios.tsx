/* Sezgirlik va ssenariy tahlili, kutilayotgan foyda va CVP cheklovlari */
import { useState } from 'react'
import { fmt } from '../lib/format'
import { Icon } from '../lib/icons'
import { Frame } from './Frame'
import { useSlideCommands } from '../ai/bridge'
import s from './Slides.module.css'

const Q = 6_000
const SCEN = [
  { id: 'best', name: 'Eng yaxshi', md: 48, fixed: 145, p: 25 },
  { id: 'base', name: 'Asosiy', md: 40, fixed: 160, p: 50 },
  { id: 'worst', name: 'Eng yomon', md: 30, fixed: 180, p: 25 },
].map((x) => ({ ...x, profit: (x.md * 1e3 * Q) / 1e6 - x.fixed }))

export function Scenarios() {
  const [probs, setProbs] = useState(SCEN.map((x) => x.p))
  const [sel, setSel] = useState<string | null>(null)

  useSlideCommands('scenarios', (a) => {
    const raw = [a.best_percent, a.base_percent, a.worst_percent]
    let next = probs
    if (raw.every((x) => typeof x === 'number')) {
      const r = raw as number[]
      const total = r.reduce((x, y) => x + y, 0) || 1
      next = r.map((x) => Math.round((x / total) * 100))
      setProbs(next)
    }
    const exp = SCEN.reduce((acc, x, i) => acc + (x.profit * next[i]) / 100, 0)
    return { probabilities_percent: next, profits_mln: SCEN.map((x) => ({ scenario: x.name, profit: x.profit })), expected_profit_mln: exp }
  })
  const sum = probs.reduce((a, b) => a + b, 0)
  const expected = SCEN.reduce((acc, x, i) => acc + (x.profit * probs[i]) / 100, 0)

  // bitta ehtimollik o‘zgarsa, qolganlari mutanosib ravishda 100 % ga to‘ldiriladi
  const setP = (i: number, val: number) => {
    setProbs((prev) => {
      const rest = prev.reduce((a, b, k) => (k === i ? a : a + b), 0)
      const left = 100 - val
      return prev.map((p, k) => (k === i ? val : rest > 0 ? Math.round((p / rest) * left) : Math.round(left / 2)))
    })
  }

  return (
    <Frame
      kicker="Risk · Ssenariylar"
      title="Ssenariylar foyda diapazonini ko‘rsatadi"
      lead="Sezgirlik — bitta parametr o‘zgaradi, qolganlari o‘zgarmas. Ssenariy — bog‘liq taxminlar birga o‘zgaradi: riskning kengroq ko‘rinishi."
    >
      <div className={s.colsChart}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Ssenariy</th>
              <th>Birlik MD, ming</th>
              <th>Doimiy xarajat, mln</th>
              <th>Foyda (6 000 dona), mln</th>
              <th>Ehtimollik</th>
              <th>Vaznlangan foyda</th>
            </tr>
          </thead>
          <tbody>
            {SCEN.map((x, i) => (
              <tr key={x.id} className={sel === x.id ? s.rowOn : ''} onMouseEnter={() => setSel(x.id)} onMouseLeave={() => setSel(null)}>
                <th>{x.name}</th>
                <td>{x.md}</td>
                <td>{x.fixed}</td>
                <td>{fmt(x.profit)}</td>
                <td className={s.cellInput}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={probs[i]}
                    onChange={(e) => setP(i, Number(e.target.value))}
                    aria-label={`${x.name} ssenariy ehtimolligi`}
                  />
                  <span>{probs[i]} %</span>
                </td>
                <td>{fmt((x.profit * probs[i]) / 100, 2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6}>Foyda = birlik MD × 6 000 − doimiy xarajat · ehtimolliklar yig‘indisi {sum} %</td>
            </tr>
          </tfoot>
        </table>

        <aside className={s.readout}>
          <p className={s.label}>Kutilayotgan foyda</p>
          <p className={s.bigNum}>
            {fmt(expected, 2)} <small>mln so‘m</small>
          </p>
          <div className={s.share} aria-hidden="true">
            <i style={{ width: `${Math.max(0, Math.min(100, (expected / 143) * 100))}%` }} />
          </div>
          <p className={s.readoutNote}>
            Diapazon: <b>0</b> dan <b>143 mln</b> gacha. Manbadagi 25 / 50 / 25 taqsimotda — 75,75 mln.
          </p>
          <ul className={s.miniList}>
            <li>
              <Icon id="split" size={16} />
              Sezgirlik: bitta parametr, qolganlari o‘zgarmas
            </li>
            <li>
              <Icon id="layers" size={16} />
              Ssenariy: bog‘liq taxminlar birga o‘zgaradi
            </li>
          </ul>
          <p className={s.insight}>
            <b>Qaror</b>
            Kutilayotgan foydani zarar ehtimoli va pul oqimi bilan birga baholang.
          </p>
        </aside>
      </div>
    </Frame>
  )
}

/* ---------- CVP cheklovlari ---------- */
const LIMITS: { limit: string; fix: string }[] = [
  { limit: 'Chiziqlilik farazi', fix: 'Segmentli yoki nochiziqli model' },
  { limit: 'Sotuv tarkibi o‘zgarmas', fix: 'Bir nechta tarkib ssenariysi' },
  { limit: 'Ishlab chiqarish = sotuv', fix: 'Zaxira va quvvatni alohida model' },
  { limit: 'Bitta davr', fix: 'Uzoq muddatda DCF va kapital byudjet' },
  { limit: 'Aniq ma’lumot', fix: 'Ehtimollik va simulyatsiya' },
]

export function Limits() {
  return (
    <Frame
      kicker="Risk · Cheklovlar"
      title="CVP cheklovlari modelni ehtiyotkor talqin qilishni talab qiladi"
      lead="Har bir cheklovning o‘z yechimi bor: model doirasidan chiqqan vaziyatda uni kengaytirilgan vosita bilan to‘ldiring."
    >
      <div className={s.cols2}>
        <div>
          <h3 className={s.label}>Cheklov → kengaytirilgan yondashuv</h3>
          <ul className={s.pairList}>
            {LIMITS.map((l) => (
              <li key={l.limit} className={s.pairRow}>
                <span className={s.pairBy}>
                  <Icon id="warn" size={18} className={s.warnIcon} />
                  {l.limit}
                </span>
                <span className={s.pairKinds}>
                  <b>{l.fix}</b>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={s.stack}>
          <h3 className={s.label}>CVP registrlardan analitik modelga o‘tadi</h3>
          <ol className={s.flowList}>
            {['Sotuv tushumi', 'O‘zgaruvchan xarajat', 'Marjinal daromad', 'Doimiy xarajat', 'Operatsion foyda'].map((n, i) => (
              <li key={n}>
                <span className={s.stageNo}>0{i + 1}</span>
                {n}
              </li>
            ))}
          </ol>
          <p className={s.keyLine}>CVP — bashorat emas, boshqaruv kompasidir: narx, hajm, xarajat, tarkib va riskni bitta tilda gaplashtiradi.</p>
        </div>
      </div>
    </Frame>
  )
}
