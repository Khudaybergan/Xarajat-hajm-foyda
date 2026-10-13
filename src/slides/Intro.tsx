/* Kirish: muqova, CVP zanjiri va reja, boshqaruv savollari, farazlar */
import { useEffect, useState } from 'react'
import { CVP_ROOT } from '../data/tree'
import { Icon } from '../lib/icons'
import { Frame, type SlideProps } from './Frame'
import s from './Slides.module.css'

/* ---------- muqova bezagi: xaritaning kichik nusxasi ---------- */
function OrbitArt() {
  const kids = CVP_ROOT.children ?? []
  const C = 310
  const R = 222
  return (
    <svg className={s.orbitArt} viewBox="0 0 620 620" aria-hidden="true">
      <circle className={s.artOrbit} cx={C} cy={C} r={R} />
      <circle className={s.artOrbit} cx={C} cy={C} r={R + 62} />
      {kids.map((n, i) => {
        const a = ((-90 + (360 / kids.length) * i) * Math.PI) / 180
        const x = C + R * Math.cos(a)
        const y = C + R * Math.sin(a)
        const d = `M${x.toFixed(1)},${y.toFixed(1)} L${C},${C}`
        return (
          <g key={n.id}>
            <path id={`art-${n.id}`} className={s.artEdge} d={d} />
            <circle className={s.artPulse} r="3">
              <animateMotion dur={`${2.6 + (i % 3) * 0.5}s`} begin={`${-i * 0.4}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1">
                <mpath href={`#art-${n.id}`} />
              </animateMotion>
            </circle>
            <circle className={s.artNode} cx={x} cy={y} r="29" />
            <g transform={`translate(${x - 14}, ${y - 14})`} className={s.artIcon}>
              <Icon id={n.icon ?? 'grid'} size={28} />
            </g>
          </g>
        )
      })}
      <circle className={s.artCoreDash} cx={C} cy={C} r="92" />
      <circle className={s.artCore} cx={C} cy={C} r="80" />
      <g transform={`translate(${C - 22}, ${C - 50})`} className={s.artCoreIcon}>
        <Icon id="target" size={44} />
      </g>
      <text className={s.artCoreText} x={C} y={C + 26} textAnchor="middle">
        CVP
      </text>
    </svg>
  )
}

export function Cover({ next }: SlideProps) {
  return (
    <section className={s.cover}>
      <div className={s.coverText}>
        <p className={s.kicker}>Boshqaruv hisobi · 5-mavzu</p>
        <h1 className={s.coverTitle}>«Xarajat–hajm–foyda» tahlili va zararsizlik nuqtasi</h1>
        <p className={s.coverLead}>Sotuv hajmi, foyda va risk bo‘yicha boshqaruv qarorlari: marjinal daromaddan ssenariy tahliligacha.</p>
        <dl className={s.coverMeta}>
          <div>
            <dt>Tayyorladilar</dt>
            <dd>Shakhlo Mustafayeva</dd>
          </div>
          <div>
            <dt>&nbsp;</dt>
            <dd>Mubasher Murodullaev</dd>
          </div>
        </dl>
        <div className={s.coverActions}>
          <button className={s.cta} onClick={next}>
            Taqdimotni boshlash
            <Icon id="right" size={20} />
          </button>
          <span className={s.hint}>← → slaydlar · F to‘liq ekran · M mundarija</span>
        </div>
      </div>
      <OrbitArt />
    </section>
  )
}

/* ---------- CVP zanjiri va ma’ruza rejasi ---------- */
const CHAIN = [
  { name: 'Narx va hajm', sub: 'Tushum = P × Q' },
  { name: 'Xarajat xulqi', sub: 'Doimiy va o‘zgaruvchan' },
  { name: 'Marjinal daromad', sub: 'MD = Tushum − O‘zgaruvchan' },
  { name: 'Operatsion foyda', sub: 'Foyda = MD − Doimiy' },
]

const PLAN = [
  'CVP modeli va asosiy farazlar',
  'Marjinal daromad va zararsizlik',
  'Maqsadli foyda, xavfsizlik va leveraj',
  'Ko‘p mahsulotli va cheklangan resursli qarorlar',
  'Ssenariy, risk va umumiy tavsiyalar',
]

export function Chain() {
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(true)

  // bosqichlar navbat bilan yonadi; foydalanuvchi bosgach — to‘xtaydi
  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setStep((p) => (p + 1) % CHAIN.length), 1700)
    return () => window.clearInterval(t)
  }, [auto])

  return (
    <Frame
      kicker="Kirish · Model"
      title="CVP foydani boshqarish zanjirini ochadi"
      lead="Cost–Volume–Profit: narx, hajm va xarajat orqali operatsion foydaga olib boradigan to‘rt bo‘g‘inli zanjir."
    >
      <div className={s.process}>
        <ol className={s.steps}>
          {CHAIN.map((c, i) => (
            <li key={c.name} className={s.stepItem}>
              <button
                className={`${s.step} ${i === step ? s.stepOn : ''} ${i < step ? s.stepDone : ''}`}
                aria-current={i === step ? 'step' : undefined}
                onClick={() => {
                  setAuto(false)
                  setStep(i)
                }}
              >
                <span className={s.stepNo}>0{i + 1}</span>
                <span className={s.stepName}>{c.name}</span>
                <span className={s.stepSub}>{c.sub}</span>
              </button>
              {i < CHAIN.length - 1 && <Icon id="right" size={22} className={s.stepArrow} />}
            </li>
          ))}
        </ol>
        <div className={s.cols2}>
          <div>
            <h3 className={s.label}>Ma’ruza rejasi</h3>
            <ol className={s.planList}>
              {PLAN.map((p, i) => (
                <li key={p} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
                  <span className={s.benefitNo}>{i + 1}</span>
                  {p}
                </li>
              ))}
            </ol>
          </div>
          <p className={s.keyLine}>
            CVP tahlili sotuv narxi, sotuv hajmi, o‘zgaruvchan va doimiy xarajatlar hamda mahsulot tarkibining operatsion foydaga
            ta’sirini aniqlash uchun qo‘llanadi.
          </p>
        </div>
      </div>
    </Frame>
  )
}

/* ---------- CVP qaysi savollarga javob beradi ---------- */
const QUESTIONS = [
  { icon: 'cart', q: 'Qancha sotish kerak?', a: 'Zararsizlik yoki maqsadli foyda hajmi' },
  { icon: 'tag', q: 'Narx pasaysa nima bo‘ladi?', a: 'Yangi MD va yangi zararsizlik nuqtasi' },
  { icon: 'coins', q: 'Reklama foydalimi?', a: 'Qo‘shimcha MD doimiy xarajat bilan qiyoslanadi' },
  { icon: 'shield', q: 'Talab pasayishiga chidamlilik?', a: 'Xavfsizlik marjasi va leveraj' },
  { icon: 'clock', q: 'Qaysi mahsulot ustuvor?', a: 'Cheklovchi resurs birligiga MD' },
]

export function Questions() {
  return (
    <Frame
      kicker="Kirish · Qo‘llanish"
      title="CVP qaysi boshqaruv savollariga javob beradi"
      lead="Har bir savolga CVP modelining aniq ko‘rsatkichi javob beradi."
    >
      <ul className={s.qaGrid}>
        {QUESTIONS.map((x, i) => (
          <li key={x.q} className={s.tile} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            <span className={s.tileIcon}>
              <Icon id={x.icon} size={28} />
            </span>
            <span className={s.tileName}>{x.q}</span>
            <span className={s.tileSub}>{x.a}</span>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

/* ---------- farazlar ---------- */
const ASSUMPTIONS = [
  'Narx relevant diapazonda o‘zgarmaydi',
  'Birlik o‘zgaruvchan xarajat doimiy',
  'Jami doimiy xarajat o‘zgarmaydi',
  'Ishlab chiqarish va sotuv hajmi mos',
  'Sotuv tarkibi barqaror',
  'Xarajat va daromad funksiyalari chiziqli',
]

export function Assumptions() {
  return (
    <Frame
      kicker="Kirish · Farazlar"
      title="CVP natijasi farazlar ichida ishonchli"
      lead="Model oltita shartga tayanadi. Faraz buzilsa — natija ham o‘z kuchini yo‘qotadi."
    >
      <div className={s.cols2}>
        <ol className={s.checkList}>
          {ASSUMPTIONS.map((a, i) => (
            <li key={a} style={{ animationDelay: `${0.12 + i * 0.08}s` }}>
              <span className={s.checkMark}>
                <Icon id="check" size={18} />
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ol>
        <div className={s.stack}>
          <div className={s.decision}>
            <b>Qaror</b>
            Faraz buzilsa, natijani yangi relevant diapazon yoki ssenariyda qayta hisoblang.
          </div>
          <div className={s.quoteSm}>
            <h3>Relevant diapazon nima?</h3>
            <p>
              Faoliyat hajmining shunday oralig‘iki, unda doimiy xarajat jami summada, o‘zgaruvchan xarajat esa birlikka
              hisoblaganda o‘zgarmaydi. CVP formulalari aynan shu oraliq uchun to‘g‘ri.
            </p>
          </div>
        </div>
      </div>
    </Frame>
  )
}
