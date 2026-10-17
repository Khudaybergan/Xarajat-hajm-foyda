/* Yakun: xulosa, tavsiyalar, minnatdorchilik */
import { Icon } from '../lib/icons'
import { Frame } from './Frame'
import s from './Slides.module.css'

/* ---------- xulosa ---------- */
const CONCLUSIONS = [
  'CVP narx, hajm, xarajat va foydani bitta modelda bog‘laydi.',
  'Zararsizlik va maqsadli foyda sotuv rejasini raqamlashtiradi.',
  'Xavfsizlik marjasi va DOL risk chegarasini ko‘rsatadi.',
  'Paket MD va resursga MD assortiment qarorini yaxshilaydi.',
]
const CONTROL = ['Farazlar relevantmi?', 'Sotuv tarkibi barqarormi?', 'Risk uchun ssenariy bormi?']
const PRINCIPLE = ['Zarar', 'Zararsizlik', 'Foyda', 'Barqaror o‘sish']

export function Summary() {
  return (
    <Frame kicker="Yakun" title="Mavzu bo‘yicha xulosa">
      <div className={s.summary}>
        <ol className={`${s.conclusions} ${s.conclusions4}`}>
          {CONCLUSIONS.map((c, i) => (
            <li key={i} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
              <span className={s.conNo}>{i + 1}</span>
              <p>{c}</p>
            </li>
          ))}
        </ol>
        <div className={s.cols2}>
          <div>
            <h3 className={s.label}>Nazorat savollari</h3>
            <ul className={s.controlList}>
              {CONTROL.map((q) => (
                <li key={q}>
                  <Icon id="chat" size={20} />
                  {q}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={s.label}>Har bir reja uchun yo‘l</h3>
            <ol className={s.chain}>
              {PRINCIPLE.map((p, i) => (
                <li key={p}>
                  <span>{p}</span>
                  {i < PRINCIPLE.length - 1 && <Icon id="right" size={20} className={s.stepArrow} />}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Frame>
  )
}

/* ---------- tavsiyalar ---------- */
const ADVICE = [
  { name: 'Bazani yangilang', body: 'Narx, birlik o‘zgaruvchan va doimiy xarajatni har oy tekshiring.' },
  { name: 'Chegarani belgilang', body: 'Zararsizlik, maqsadli foyda va xavfsizlik marjasini rejaga kiriting.' },
  { name: 'Riskni sinang', body: 'Narx, hajm va xarajat uchun kamida uchta ssenariy tuzing.' },
  { name: 'Tarkibni boshqaring', body: 'Yuqori MDli mahsulot ulushi va cheklovchi resursga MDni kuzating.' },
  { name: 'Qarorni kengaytiring', body: 'CVP natijasini sifat, quvvat, mijoz va strategiya bilan birga baholang.' },
]

export function Advice() {
  return (
    <Frame
      kicker="Yakun · Tavsiyalar"
      title="Boshqaruv qarorlari bo‘yicha umumiy tavsiyalar"
      lead="CVP — bashorat emas, boshqaruv kompasidir. Har bir reja uchun: zararsizlik → xavfsizlik → ssenariy → qaror."
    >
      <ul className={`${s.benefits} ${s.adviceList}`}>
        {ADVICE.map((a, i) => (
          <li key={a.name} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
            <span className={s.benefitNo}>{i + 1}</span>
            <span>
              <b>{a.name}.</b> {a.body}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

export function Thanks() {
  return (
    <section className={s.thanks}>
      <p className={s.kicker}>Boshqaruv hisobi · 5-mavzu</p>
      <h2 className={s.thanksTitle}>E’tiboringiz uchun rahmat</h2>
      <p className={s.thanksQuote}>Narx · hajm · xarajat · tarkib · risk — CVP boshqaruv kompasidir.</p>
      <p className={s.thanksMeta}>Shakhlo Mustafayeva · Mubasher Murodullaev</p>
    </section>
  )
}
