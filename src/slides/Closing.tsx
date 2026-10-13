/* Yakun: xulosa, tavsiyalar, minnatdorchilik; zaxira: guruh muhokamasi, adabiyotlar */
import { useState } from 'react'
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

/* ---------- zaxira: guruh muhokamasi ---------- */
const GROUPS = [
  {
    role: 'Moliya direktori',
    q: 'Korxona 7 500 dona sotuv rejasini qabul qilishi kerakmi? Nima uchun?',
    a: 'Ha. 7 500 dona sotuv 5 000 donalik zararsizlik nuqtasidan yuqori va 150 mln so‘mlik operatsion foydani ta’minlaydi.',
  },
  {
    role: 'Marketing direktori',
    q: '60 mln so‘mlik reklama xarajatini oshirishni tavsiya qilasizmi?',
    a: 'Ha. Qo‘shimcha MD 72 mln so‘m, qo‘shimcha xarajat 60 mln so‘m. Natijada foyda 12 mln so‘mga oshadi.',
  },
  {
    role: 'Risk menejeri',
    q: 'Narx 5 % pasaysa, korxona qanday xavfga duch keladi?',
    a: 'Birlik MD 60 mingdan 52,5 ming so‘mgacha tushadi, zararsizlik hajmi 5 000 donadan 5 715 donaga oshadi.',
  },
  {
    role: 'Strategik menejer',
    q: 'Foydani oshirish uchun narxni oshirish, xarajatni kamaytirish yoki hajmni oshirishning qaysi biri ma’qul?',
    a: 'Talabalar uchta variantni hisob-kitob asosida himoya qiladilar: har biri MD va zararsizlikka turlicha ta’sir qiladi.',
  },
]

export function Discussion() {
  const [open, setOpen] = useState(0)
  const cur = GROUPS[open]
  return (
    <Frame
      kicker="Qo‘shimcha · Interfaol muhokama"
      title="Guruhlar uchun interfaol muhokama"
      lead="Hisob-kitob tugagach, o‘qituvchi har bir guruhga bitta rol va savol beradi. 3–4 kishilik guruhlar, 45–60 daqiqa."
    >
      <div className={s.centers}>
        <ul className={s.centerRow} role="tablist" aria-label="Guruhlar">
          {GROUPS.map((g, i) => (
            <li key={g.role}>
              <button role="tab" aria-selected={open === i} className={`${s.center} ${open === i ? s.centerOn : ''}`} onClick={() => setOpen(i)}>
                <span className={s.centerNo}>{i + 1}-guruh</span>
                <span className={s.centerName}>{g.role}</span>
                <span className={s.centerUnits}>{g.q}</span>
              </button>
            </li>
          ))}
        </ul>
        <div key={open} className={s.centerDetail}>
          <div>
            <h3 className={s.label}>Kutiladigan javob</h3>
            <p className={s.readoutName}>{cur.role}</p>
          </div>
          <p className={s.centerBody}>{cur.a}</p>
        </div>
      </div>
    </Frame>
  )
}

/* ---------- zaxira: adabiyotlar ---------- */
const BOOKS = [
  'Horngren, C. T., Datar, S. M., Rajan, M. V. Cost Accounting: A Managerial Emphasis. 16th ed. Pearson, 2018.',
  'Drury, C. Management and Cost Accounting. 11th ed. Cengage Learning, 2021.',
  'Garrison, R. H., Noreen, E. W., Brewer, P. C. Managerial Accounting. 17th ed. McGraw-Hill, 2021.',
  'Hilton, R. W., Platt, D. E. Managerial Accounting: Creating Value in a Dynamic Business Environment. 12th ed. McGraw-Hill, 2017.',
  'Atkinson, A. A., Kaplan, R. S., Matsumura, E. M., Young, S. M. Management Accounting. 6th ed. Pearson, 2012.',
  'Blocher, E. J., Stout, D. E., Juras, P. E., Cokins, G. Cost Management: A Strategic Emphasis. 7th ed. McGraw-Hill, 2016.',
  'Kinney, M. R., Raiborn, C. A. Cost Accounting: Foundations and Evolutions. 10th ed. Cengage Learning, 2013.',
  'Lanen, W. N., Anderson, S. W., Maher, M. W. Fundamentals of Cost Accounting. 6th ed. McGraw-Hill, 2022.',
  'Morse, W. J., Davis, J. R., Hartgraves, A. L. Management Accounting: A Strategic Approach. South-Western Cengage, 2007.',
  'Mowen, M. M., Hansen, D. R., Heitger, D. L. Cornerstones of Managerial Accounting. 7th ed. Cengage Learning, 2020.',
]

export function Literature() {
  return (
    <Frame kicker="Qo‘shimcha · Adabiyotlar" title="Foydalanilgan adabiyotlar">
      <ol className={s.books}>
        {BOOKS.map((b, i) => (
          <li key={b}>
            <span className={s.stageNo}>{String(i + 1).padStart(2, '0')}</span>
            <Icon id="book" size={18} className={s.bookIcon} />
            <span>{b}</span>
          </li>
        ))}
      </ol>
    </Frame>
  )
}
