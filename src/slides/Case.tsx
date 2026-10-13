/* Interfaol keys: «NAVRO‘Z TEXNO» MCHJ — shartlar, topshiriqlar va interaktiv yechim.
   Manba raqamlari: narx 150 000, o‘zgaruvchan 90 000, doimiy 300 mln, reja 7 500 dona, soliq 20 %. */
import { useState } from 'react'
import { fmt } from '../lib/format'
import { Icon } from '../lib/icons'
import { Frame, Seg } from './Frame'
import { useSlideCommands } from '../ai/bridge'
import s from './Slides.module.css'

const BASE = { p: 150_000, v: 90_000, f: 300, plan: 7_500, tax: 20, targetOp: 150, targetNet: 120, adFixed: 60, adUnits: 1_200, priceCut: 5 }

const CONDITIONS = [
  { name: 'Mahsulotning sotuv narxi', value: '150 000 so‘m/dona' },
  { name: 'Bir birlik o‘zgaruvchan xarajat', value: '90 000 so‘m/dona' },
  { name: 'Oylik doimiy xarajatlar', value: '300 mln so‘m' },
  { name: 'Rejalashtirilgan sotuv', value: '7 500 dona' },
  { name: 'Foyda solig‘i stavkasi', value: '20 %' },
]

const QUESTIONS = [
  'Korxona zarar ko‘rmasligi uchun kamida qancha mahsulot sotishi kerak?',
  '150 mln so‘m operatsion foyda olish uchun qancha mahsulot sotish zarur?',
  '120 mln so‘m sof foyda olish mumkinmi?',
  'Bozor sharoiti yomonlashib, narx 5 % pasaysa, korxona qanday holatga tushadi?',
  '60 mln so‘mlik qo‘shimcha reklama xarajati foydalimi?',
  'Rejalashtirilgan sotuv qanchalik xavfsiz?',
]

export function CaseIntro() {
  return (
    <Frame
      kicker="Keys · «Navro‘z Texno» MCHJ"
      title="Keys: zararsizlik nuqtasidan maqsadli foydagacha"
      lead="Maishiy elektr jihozlar ishlab chiqaruvchi korxona kelgusi oy uchun ishlab chiqarish va sotuv rejasini shakllantirmoqda. Moliya bo‘limi ma’lumotlari:"
    >
      <div className={s.colsCase}>
        <div className={s.stack}>
          <table className={`${s.table} ${s.tableCompact}`}>
            <thead>
              <tr>
                <th>Ko‘rsatkich</th>
                <th>Miqdor</th>
              </tr>
            </thead>
            <tbody>
              {CONDITIONS.map((c) => (
                <tr key={c.name} className={s.rowStatic}>
                  <th>{c.name}</th>
                  <td>{c.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={s.keyLine}>
            «Korxona rejalashtirilgan 7 500 dona mahsulot sotish orqali yetarli va barqaror foyda oladimi hamda reklama xarajatini oshirish maqsadga muvofiqmi?»
          </p>
        </div>
        <div>
          <h3 className={s.label}>Rahbariyatda paydo bo‘lgan savollar</h3>
          <ol className={s.caseQuestions}>
            {QUESTIONS.map((q, i) => (
              <li key={q} style={{ animationDelay: `${0.12 + i * 0.07}s` }}>
                <span className={s.benefitNo}>{i + 1}</span>
                {q}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Frame>
  )
}

/* ---------- interaktiv yechim ---------- */
type Task = 'md' | 'bep' | 'target' | 'safety' | 'dol' | 'ad' | 'price'
const TASKS: { id: Task; label: string }[] = [
  { id: 'md', label: 'MD' },
  { id: 'bep', label: 'Zararsizlik' },
  { id: 'target', label: 'Maqsadli foyda' },
  { id: 'safety', label: 'Xavfsizlik' },
  { id: 'dol', label: 'DOL' },
  { id: 'ad', label: 'Reklama' },
  { id: 'price', label: 'Narx −5 %' },
]

interface Line {
  name: string
  value: string
  hot?: boolean
}

function solve(b: typeof BASE): Record<Task, { title: string; lines: Line[]; answer: string; note: string }> {
  const md = b.p - b.v
  const ratio = md / b.p
  const bepQ = (b.f * 1e6) / md
  const bepS = b.f / ratio
  const qOp = ((b.f + b.targetOp) * 1e6) / md
  const pretax = b.targetNet / (1 - b.tax / 100)
  const qNet = ((b.f + pretax) * 1e6) / md
  const mos = b.plan - bepQ
  const mosPct = (mos / b.plan) * 100
  const planS = (b.plan * b.p) / 1e6
  const tmd = (md * b.plan) / 1e6
  const op = tmd - b.f
  const dol = op !== 0 ? tmd / op : Infinity
  const adMd = (b.adUnits * md) / 1e6
  const adEffect = adMd - b.adFixed
  const newP = b.p * (1 - b.priceCut / 100)
  const newMd = newP - b.v
  const newBep = newMd > 0 ? (b.f * 1e6) / newMd : Infinity
  const newRatio = newMd / newP

  return {
    md: {
      title: 'Bir birlik marjinal daromad va MD koeffitsienti',
      lines: [
        { name: 'Birlik MD = narx − birlik o‘zgaruvchan xarajat', value: `${fmt(b.p)} − ${fmt(b.v)} = ${fmt(md)} so‘m`, hot: true },
        { name: 'MD koeffitsienti = birlik MD ÷ narx', value: `${fmt(md)} ÷ ${fmt(b.p)} = ${fmt(ratio * 100, 1)} %`, hot: true },
      ],
      answer: `${fmt(md)} so‘m · ${fmt(ratio * 100, 1)} %`,
      note: `Har 100 so‘mlik tushumdan ${fmt(ratio * 100, 0)} so‘m marjinal daromad qoladi.`,
    },
    bep: {
      title: 'Zararsizlik nuqtasi — natural va pul ifodasida',
      lines: [
        { name: 'Natural: doimiy xarajat ÷ birlik MD', value: `${fmt(b.f)} mln ÷ ${fmt(md)} = ${fmt(bepQ)} dona`, hot: true },
        { name: 'Pul ifodasida: doimiy xarajat ÷ MD koeffitsienti', value: `${fmt(b.f)} mln ÷ ${fmt(ratio * 100, 1)} % = ${fmt(bepS)} mln so‘m`, hot: true },
      ],
      answer: `${fmt(bepQ)} dona · ${fmt(bepS)} mln`,
      note: `Oylik tushum ${fmt(bepS)} mln so‘mdan kam bo‘lmasa, operatsion zarar yuzaga kelmaydi.`,
    },
    target: {
      title: 'Maqsadli operatsion va sof foyda uchun hajm',
      lines: [
        { name: `${fmt(b.targetOp)} mln operatsion foyda: (F + foyda) ÷ birlik MD`, value: `(${fmt(b.f)} + ${fmt(b.targetOp)}) mln ÷ ${fmt(md)} = ${fmt(qOp)} dona`, hot: true },
        { name: `${fmt(b.targetNet)} mln sof foyda → soliqdan oldingi foyda`, value: `${fmt(b.targetNet)} ÷ (1 − ${b.tax / 100}) = ${fmt(pretax, 1)} mln` },
        { name: 'Zarur hajm', value: `(${fmt(b.f)} + ${fmt(pretax, 1)}) mln ÷ ${fmt(md)} = ${fmt(qNet)} dona`, hot: true },
      ],
      answer: `${fmt(qOp)} dona · ${fmt(qNet)} dona`,
      note: qOp === b.plan ? 'Bu aynan korxonaning rejalashtirilgan sotuv hajmiga teng.' : `Reja ${fmt(b.plan)} dona bilan taqqoslang.`,
    },
    safety: {
      title: 'Rejalashtirilgan sotuvning xavfsizlik marjasi',
      lines: [
        { name: 'Marja = reja sotuv − zararsizlik sotuv', value: `${fmt(b.plan)} − ${fmt(bepQ)} = ${fmt(mos)} dona`, hot: true },
        { name: 'Marja foizi', value: `${fmt(mos)} ÷ ${fmt(b.plan)} = ${fmt(mosPct, 1)} %`, hot: true },
        { name: 'Pul ifodasida', value: `${fmt(planS)} − ${fmt(bepS)} = ${fmt(planS - bepS)} mln so‘m` },
      ],
      answer: `${fmt(mos)} dona · ${fmt(mosPct, 1)} %`,
      note: `Sotuv ${fmt(mosPct, 1)} % gacha pasaymaguncha korxona zarar zonasiga kirmaydi.`,
    },
    dol: {
      title: 'Operatsion leveraj darajasi',
      lines: [
        { name: `Jami MD = birlik MD × ${fmt(b.plan)} dona`, value: `${fmt(md)} × ${fmt(b.plan)} = ${fmt(tmd)} mln` },
        { name: 'Operatsion foyda = jami MD − doimiy xarajat', value: `${fmt(tmd)} − ${fmt(b.f)} = ${fmt(op)} mln` },
        { name: 'DOL = jami MD ÷ operatsion foyda', value: Number.isFinite(dol) ? `${fmt(tmd)} ÷ ${fmt(op)} = ${fmt(dol, 2)}` : '—', hot: true },
      ],
      answer: Number.isFinite(dol) ? `DOL = ${fmt(dol, 2)}` : 'DOL aniqlanmaydi',
      note: Number.isFinite(dol) ? `Sotuv 1 % o‘zgarsa, operatsion foyda taxminan ${fmt(dol, 2)} % o‘zgaradi.` : 'Operatsion foyda nolga teng.',
    },
    ad: {
      title: 'Reklama qarorini baholash',
      lines: [
        { name: `Qo‘shimcha MD = ${fmt(b.adUnits)} dona × birlik MD`, value: `${fmt(b.adUnits)} × ${fmt(md)} = ${fmt(adMd, 1)} mln` },
        { name: 'Qo‘shimcha doimiy xarajat', value: `${fmt(b.adFixed)} mln` },
        { name: 'Foyda o‘zgarishi', value: `${fmt(adMd, 1)} − ${fmt(b.adFixed)} = ${adEffect > 0 ? '+' : ''}${fmt(adEffect, 1)} mln`, hot: true },
        { name: 'Reklamadan keyingi operatsion foyda', value: `${fmt(op)} + ${fmt(adEffect, 1)} = ${fmt(op + adEffect, 1)} mln` },
      ],
      answer: adEffect > 0 ? `Foydali: +${fmt(adEffect, 1)} mln` : `Foydasiz: ${fmt(adEffect, 1)} mln`,
      note: 'Qo‘shimcha marjinal daromad qo‘shimcha doimiy xarajat bilan solishtiriladi.',
    },
    price: {
      title: `Eng yomon ssenariy: narx ${b.priceCut} % pasayadi`,
      lines: [
        { name: 'Yangi narx', value: `${fmt(b.p)} × (1 − ${b.priceCut / 100}) = ${fmt(newP)} so‘m` },
        { name: 'Yangi birlik MD', value: `${fmt(newP)} − ${fmt(b.v)} = ${fmt(newMd)} so‘m`, hot: true },
        { name: 'Yangi MD koeffitsienti', value: `${fmt(newMd)} ÷ ${fmt(newP)} = ${fmt(newRatio * 100, 2)} %` },
        { name: 'Yangi zararsizlik', value: Number.isFinite(newBep) ? `${fmt(b.f)} mln ÷ ${fmt(newMd)} = ${fmt(newBep, 2)} → ${fmt(Math.ceil(newBep))} dona` : '—', hot: true },
      ],
      answer: Number.isFinite(newBep) ? `${fmt(Math.ceil(newBep))} dona (${newBep > bepQ ? '+' : ''}${fmt(Math.ceil(newBep) - bepQ)})` : 'MD manfiy',
      note: `Narxning atigi ${b.priceCut} % pasayishi zararsizlik nuqtasini ${fmt(Math.ceil(newBep) - bepQ)} donaga oshiradi: narx CVP modeliga sezilarli ta’sir qiladi.`,
    },
  }
}

const INPUTS: { key: 'p' | 'v' | 'f' | 'plan'; label: string; unit: string; step: number }[] = [
  { key: 'p', label: 'Narx', unit: 'so‘m', step: 5_000 },
  { key: 'v', label: 'O‘zgaruvchan', unit: 'so‘m', step: 5_000 },
  { key: 'f', label: 'Doimiy', unit: 'mln', step: 10 },
  { key: 'plan', label: 'Reja', unit: 'dona', step: 250 },
]

export function CaseSolution() {
  const [task, setTask] = useState<Task>('md')
  const [b, setB] = useState(BASE)
  const sol = solve(b)[task]
  const changed = JSON.stringify(b) !== JSON.stringify(BASE)
  const bump = (k: (typeof INPUTS)[number]['key'], d: number) => setB((p) => ({ ...p, [k]: Math.max(0, p[k] + d) }))

  useSlideCommands('case-solution', (a) => {
    const t = TASKS.some((x) => x.id === a.task) ? (a.task as Task) : task
    const nb = {
      ...b,
      p: typeof a.price === 'number' ? a.price : b.p,
      v: typeof a.variable_cost === 'number' ? a.variable_cost : b.v,
      f: typeof a.fixed_cost_mln === 'number' ? a.fixed_cost_mln : b.f,
      plan: typeof a.plan_units === 'number' ? a.plan_units : b.plan,
    }
    setTask(t)
    setB(nb)
    const r = solve(nb)[t]
    return { task: t, title: r.title, steps: r.lines.map((l) => `${l.name}: ${l.value}`), answer: r.answer, note: r.note }
  })

  return (
    <Frame
      kicker="Keys · Yechim"
      title="Keys yechimi: qarorni raqamlar bilan asoslang"
      lead="Topshiriqni tanlang. Shartlarni o‘zgartirib, natija qanday siljishini tekshirish mumkin."
    >
      <div className={s.colsCaseSol}>
        <div className={s.stack}>
          <Seg label="Topshiriq" options={TASKS} value={task} onChange={setTask} />
          <div key={task} className={s.solution}>
            <h3 className={s.solutionTitle}>{sol.title}</h3>
            <ol className={s.calcSteps}>
              {sol.lines.map((l, i) => (
                <li key={l.name} className={l.hot ? s.calcHot : ''}>
                  <span className={s.stageNo}>0{i + 1}</span>
                  <span className={s.calcName}>{l.name}</span>
                  <span className={s.calcValue}>{l.value}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <aside className={s.stack}>
          <div className={s.readout}>
            <p className={s.label}>Javob</p>
            <p className={s.answer}>{sol.answer}</p>
            <p className={s.readoutNote}>{sol.note}</p>
          </div>
          <div className={s.caseInputs}>
            <h4 className={s.label}>Keys shartlari</h4>
            {INPUTS.map((inp) => (
              <div key={inp.key} className={s.caseInputRow}>
                <span>
                  {inp.label} <small className={s.stUnit}>{inp.unit}</small>
                </span>
                <span className={s.stepper}>
                  <button onClick={() => bump(inp.key, -inp.step)} aria-label={`${inp.label}: kamaytirish`}>
                    <Icon id="minus" size={16} />
                  </button>
                  <output className={s.stOut}>{fmt(b[inp.key])}</output>
                  <button onClick={() => bump(inp.key, inp.step)} aria-label={`${inp.label}: oshirish`}>
                    <Icon id="plus" size={16} />
                  </button>
                </span>
              </div>
            ))}
            {changed && (
              <div className={s.stageReset}>
                <button className={s.ghostBtn} onClick={() => setB(BASE)}>
                  Keys shartlariga qaytish
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </Frame>
  )
}

/* ---------- yakuniy natijalar jadvali ---------- */
const RESULTS = [
  ['Sotuv narxi', '150 000 so‘m'],
  ['O‘zgaruvchan xarajat', '90 000 so‘m'],
  ['Birlik MD', '60 000 so‘m'],
  ['MD koeffitsienti', '40 %'],
  ['Zararsizlik nuqtasi', '5 000 dona'],
  ['Zararsizlik sotuv qiymati', '750 mln so‘m'],
  ['150 mln operatsion foyda uchun hajm', '7 500 dona'],
  ['120 mln sof foyda uchun hajm', '7 500 dona'],
  ['Xavfsizlik marjasi', '2 500 dona · 33,3 %'],
  ['Xavfsizlik marjasi, qiymatda', '375 mln so‘m'],
  ['DOL', '3'],
  ['Reklama natijasidagi foyda o‘sishi', '12 mln so‘m'],
  ['Reklamadan keyingi foyda', '162 mln so‘m'],
  ['Narx 5 % pasaygandagi yangi MD', '52 500 so‘m'],
  ['Narx 5 % pasaygandagi zararsizlik', '5 715 dona'],
]

export function CaseResults() {
  const half = Math.ceil(RESULTS.length / 2)
  return (
    <Frame kicker="Keys · Yakuniy jadval" title="Keysning yakuniy natijalari" lead="«Navro‘z Texno» MCHJ bo‘yicha barcha hisob-kitoblar bitta jadvalda.">
      <div className={s.cols2}>
        {[RESULTS.slice(0, half), RESULTS.slice(half)].map((group, g) => (
          <table key={g} className={`${s.table} ${s.tableCompact}`}>
            <tbody>
              {group.map(([name, value], i) => (
                <tr key={name} className={s.rowStatic}>
                  <td className={s.resNo}>{g * half + i + 1}</td>
                  <th>{name}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </Frame>
  )
}
