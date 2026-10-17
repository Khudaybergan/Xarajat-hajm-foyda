/* Qarorlar: parametr o‘zgarishining ta’siri va reklama qarori (interaktiv) */
import { useState } from 'react'
import { fmt } from '../lib/format'
import { Icon } from '../lib/icons'
import { Frame } from './Frame'
import { useSlideCommands } from '../ai/bridge'
import s from './Slides.module.css'

/* ---------- parametr o‘zgarishi ---------- */
type Dir = 'up' | 'down' | 'equal'
const EFFECTS: { change: string; md: string; mdDir: Dir; bep: string; bepDir: Dir; good: boolean }[] = [
  { change: 'Narx oshadi', md: 'MD oshadi', mdDir: 'up', bep: 'Zararsizlik kamayadi', bepDir: 'down', good: true },
  { change: 'O‘zgaruvchan xarajat oshadi', md: 'MD kamayadi', mdDir: 'down', bep: 'Zararsizlik oshadi', bepDir: 'up', good: false },
  { change: 'Doimiy xarajat oshadi', md: 'MD o‘zgarmaydi', mdDir: 'equal', bep: 'Zararsizlik oshadi', bepDir: 'up', good: false },
  { change: 'Hajm oshadi', md: 'Nuqta o‘zgarmaydi', mdDir: 'equal', bep: 'Foyda oshadi', bepDir: 'up', good: true },
  { change: 'Yuqori MDli mahsulot ulushi oshadi', md: 'O‘rtacha MD oshadi', mdDir: 'up', bep: 'Zararsizlik kamayadi', bepDir: 'down', good: true },
]

const DIR_CLASS: Record<Dir, string> = { up: s.dirUp, down: s.dirDown, equal: s.dirEq }

export function Effects() {
  return (
    <Frame
      kicker="Qarorlar · Parametrlar"
      title="Parametr o‘zgarishi zararsizlikka turlicha ta’sir qiladi"
      lead="Qaror qabul qilishdan oldin har bir o‘zgarishni marjinal daromad va zararsizlik nuqtasi orqali tekshiring."
    >
      <ul className={s.effectList}>
        {EFFECTS.map((e, i) => (
          <li key={e.change} className={s.effectRow} style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
            <span className={s.effectChange}>{e.change}</span>
            <Icon id="right" size={20} className={s.stepArrow} />
            <span className={`${s.effectCell} ${DIR_CLASS[e.mdDir]}`}>
              <Icon id={e.mdDir} size={18} />
              {e.md}
            </span>
            <span className={`${s.effectCell} ${e.good ? s.dirUp : s.dirDown}`}>
              <Icon id={e.bepDir} size={18} />
              {e.bep}
            </span>
          </li>
        ))}
      </ul>
      <p className={s.keyLine} style={{ marginTop: 22 }}>
        Zararsizlikning kamayishi — yaxshi signal (yashil), oshishi — risk (qizg‘ish). Hajm o‘sishi nuqtani siljitmaydi, lekin foydani oshiradi.
      </p>
    </Frame>
  )
}

/* ---------- reklama qarori ---------- */
const MD = 40_000

export function Advertising() {
  const [extraFixed, setExtraFixed] = useState(30) // mln
  const [extraUnits, setExtraUnits] = useState(900)

  useSlideCommands('advertising', (a) => {
    const f = typeof a.extra_fixed_mln === 'number' ? Math.max(0, Math.min(80, a.extra_fixed_mln)) : extraFixed
    const u = typeof a.extra_units === 'number' ? Math.max(0, Math.min(2000, Math.round(a.extra_units))) : extraUnits
    setExtraFixed(f)
    setExtraUnits(u)
    const em = (u * MD) / 1e6
    return { extra_fixed_mln: f, extra_units: u, extra_md_mln: em, profit_change_mln: em - f, decision: em - f > 0 ? 'foydali' : 'foydasiz' }
  })
  const extraMd = (extraUnits * MD) / 1e6
  const effect = extraMd - extraFixed
  const ok = effect > 0
  const bepUnits = (extraFixed * 1e6) / MD

  return (
    <Frame
      kicker="Qarorlar · Reklama"
      title="Reklama qarori qo‘shimcha MD bilan baholanadi"
      lead="Reklama doimiy xarajatni oshiradi, sotuv hajmini esa ko‘paytiradi. Qo‘shimcha MD qo‘shimcha doimiy xarajatdan katta bo‘lsa — foydali."
    >
      <div className={s.colsTarget}>
        <div className={s.stack}>
          <div className={s.formulaBig}>Qo‘shimcha MD &gt; Qo‘shimcha doimiy xarajat → reklama foydali</div>
          <label className={s.sliderRow}>
            <span className={s.label}>
              Qo‘shimcha doimiy xarajat (reklama) — <b>{fmt(extraFixed)} mln so‘m</b>
            </span>
            <input type="range" min={0} max={80} step={2} value={extraFixed} onChange={(e) => setExtraFixed(Number(e.target.value))} />
          </label>
          <label className={s.sliderRow}>
            <span className={s.label}>
              Kutilayotgan sotuv o‘sishi — <b>{fmt(extraUnits)} dona</b>
            </span>
            <input type="range" min={0} max={2_000} step={50} value={extraUnits} onChange={(e) => setExtraUnits(Number(e.target.value))} />
          </label>
          <ol className={s.calcSteps}>
            <li>
              <span className={s.stageNo}>01</span>
              <span className={s.calcName}>Qo‘shimcha marjinal daromad</span>
              <span className={s.calcValue}>
                {fmt(extraUnits)} × {fmt(MD)} = {fmt(extraMd, 1)} mln
              </span>
            </li>
            <li>
              <span className={s.stageNo}>02</span>
              <span className={s.calcName}>Qo‘shimcha doimiy xarajat</span>
              <span className={s.calcValue}>{fmt(extraFixed)} mln</span>
            </li>
            <li>
              <span className={s.stageNo}>03</span>
              <span className={s.calcName}>Foyda o‘zgarishi</span>
              <span className={`${s.calcValue} ${effect < 0 ? s.neg : ''}`}>
                {fmt(extraMd, 1)} − {fmt(extraFixed)} = {effect > 0 ? '+' : ''}
                {fmt(effect, 1)} mln
              </span>
            </li>
          </ol>
        </div>
        <aside className={s.readout}>
          <p className={s.label}>Qaror</p>
          <p className={`${s.readoutName} ${ok ? s.okText : s.neg}`}>{ok ? 'Reklama foydali' : effect === 0 ? 'Natija nol' : 'Reklama foydasiz'}</p>
          <p className={`${s.bigNum} ${effect < 0 ? s.neg : ''}`}>
            {effect > 0 ? '+' : ''}
            {fmt(effect, 1)} <small>mln so‘m</small>
          </p>
          <p className={s.readoutNote}>
            Reklama o‘zini oqlashi uchun kamida <b>{fmt(bepUnits)} dona</b> qo‘shimcha sotuv kerak.
          </p>
          <p className={s.insight}>
            <b>Asosiy misol</b>
            +30 mln doimiy xarajat va +900 dona sotuv: 36 mln − 30 mln = +6 mln. Ijobiy ta’sir sabab reklama varianti ma’qullanishi mumkin.
          </p>
        </aside>
      </div>
    </Frame>
  )
}
