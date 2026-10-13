/* Xavfsizlik marjasi va operatsion leveraj (interaktiv).
   Asosiy misol: reja 6 000 dona, Q₀ 4 000 → XM 2 000 dona (33,3 %);
   DOL = 240 ÷ 80 = 3; sotuv ±10 % → foyda ±30 %. */
import { useState } from 'react'
import { fmt } from '../lib/format'
import { Icon } from '../lib/icons'
import { Frame } from './Frame'
import { useSlideCommands } from '../ai/bridge'
import s from './Slides.module.css'

const MD = 40_000
const F = 160 // mln
const Q0 = 4_000
const PLAN = 6_000
const BASE_TMD = (MD * PLAN) / 1e6 // 240
const BASE_PROFIT = BASE_TMD - F // 80
const DOL = BASE_TMD / BASE_PROFIT // 3

export function Risk() {
  const [delta, setDelta] = useState(10) // sotuv o‘zgarishi, %

  useSlideCommands('risk', (a) => {
    const d = typeof a.sales_change_percent === 'number' ? Math.max(-30, Math.min(30, Math.round(a.sales_change_percent))) : delta
    setDelta(d)
    const qq = PLAN * (1 + d / 100)
    const pr = (MD * qq) / 1e6 - F
    return {
      sales_change_percent: d,
      new_volume_units: qq,
      new_profit_mln: pr,
      profit_change_percent: ((pr - BASE_PROFIT) / BASE_PROFIT) * 100,
      dol: DOL,
      margin_of_safety_units: PLAN - Q0,
      margin_of_safety_percent: ((PLAN - Q0) / PLAN) * 100,
    }
  })
  const q = PLAN * (1 + delta / 100)
  const profit = (MD * q) / 1e6 - F
  const change = ((profit - BASE_PROFIT) / BASE_PROFIT) * 100
  const mos = PLAN - Q0
  const mosPct = (mos / PLAN) * 100

  return (
    <Frame
      kicker="Risk · Xavfsizlik marjasi va leveraj"
      title="Xavfsizlik marjasi va operatsion leveraj riskni o‘lchaydi"
      lead="Xavfsizlik marjasi — talab pasayishiga chidamlilik; leveraj — foydaning sotuv o‘zgarishiga sezgirligi."
    >
      <div className={s.cols2}>
        {/* ---- xavfsizlik marjasi ---- */}
        <div className={s.panelCard}>
          <h3 className={s.panelTitle}>
            <Icon id="shield" size={24} />
            Xavfsizlik marjasi
          </h3>
          <div className={s.safetyBar} aria-hidden="true">
            <div className={s.safetyLoss} style={{ width: `${(Q0 / 8_000) * 100}%` }}>
              <span>Zarar zonasi</span>
            </div>
            <div className={s.safetyMargin} style={{ width: `${(mos / 8_000) * 100}%` }}>
              <span>Xavfsizlik marjasi</span>
            </div>
            <i className={s.safetyTick} style={{ left: `${(Q0 / 8_000) * 100}%` }}>
              <b>Q₀ {fmt(Q0)}</b>
            </i>
            <i className={s.safetyTick} style={{ left: `${(PLAN / 8_000) * 100}%` }}>
              <b>Reja {fmt(PLAN)}</b>
            </i>
          </div>
          <dl className={s.kpis}>
            <div>
              <dt>Reja sotuv</dt>
              <dd>
                {fmt(PLAN)} <small>dona</small>
              </dd>
            </div>
            <div>
              <dt>Marja</dt>
              <dd>
                {fmt(mos)} <small>dona</small>
              </dd>
            </div>
            <div>
              <dt>Marja, %</dt>
              <dd>{fmt(mosPct, 1)} %</dd>
            </div>
          </dl>
          <div className={s.formulaRow}>
            <strong>XM</strong>
            <span>
              Rejalashtirilgan sotuv − zararsizlik sotuv = 6 000 − 4 000 = <b>2 000 dona</b> (33,3 %)
            </span>
          </div>
          <p className={s.insight}>
            <b>Qaror</b>
            6 000 dona rejasini 33,3 % xavfsizlik marjasi bilan tasdiqlang: sotuv uchdan biriga tushmaguncha zarar yo‘q.
          </p>
        </div>

        {/* ---- operatsion leveraj ---- */}
        <div className={s.panelCard}>
          <h3 className={s.panelTitle}>
            <Icon id="bolt" size={24} />
            Operatsion leveraj
          </h3>
          <div className={s.formulaRow}>
            <strong>DOL</strong>
            <span>
              Jami MD ÷ Operatsion foyda = 240 mln ÷ 80 mln = <b>{DOL}</b>
            </span>
          </div>
          <label className={s.sliderRow}>
            <span className={s.label}>
              Sotuv hajmi o‘zgarishi — <b className={delta < 0 ? s.neg : ''}>{delta > 0 ? '+' : ''}{delta} %</b>
            </span>
            <input type="range" min={-30} max={30} step={1} value={delta} onChange={(e) => setDelta(Number(e.target.value))} />
          </label>
          <div className={s.leverRow}>
            <div className={s.leverCell}>
              <span className={s.label}>Sotuv</span>
              <b>
                {fmt(q)} <small>dona</small>
              </b>
            </div>
            <Icon id="right" size={26} className={s.stepArrow} />
            <div className={s.leverCell}>
              <span className={s.label}>Foyda</span>
              <b className={profit < 0 ? s.neg : ''}>
                {fmt(profit)} <small>mln</small>
              </b>
            </div>
            <Icon id="right" size={26} className={s.stepArrow} />
            <div className={`${s.leverCell} ${s.leverHot}`}>
              <span className={s.label}>Foyda o‘zgarishi</span>
              <b className={change < 0 ? s.neg : ''}>
                {change > 0 ? '+' : ''}
                {fmt(change, 0)} %
              </b>
            </div>
          </div>
          <p className={s.insight}>
            <b>Talqin</b>
            Sotuv {delta > 0 ? '+' : ''}{delta} % bo‘lsa, foyda taxminan {delta > 0 ? '+' : ''}{fmt(delta * DOL, 0)} % o‘zgaradi: leveraj imkoniyatni ham,
            riskni ham {DOL} barobar kuchaytiradi.
          </p>
        </div>
      </div>
    </Frame>
  )
}
