/* Ko‘p mahsulotli CVP (paket usuli) va cheklangan resursli qaror.
   Manba: A:B = 2:3, MD 50 / 30 ming, doimiy 380 mln → 2 000 paket;
   resurs: B 36 ming / 3 soat, A 50 ming / 5 soat, C 28 ming / 4 soat. */
import { useState } from 'react'
import { fmt } from '../lib/format'
import { Icon } from '../lib/icons'
import { Frame } from './Frame'
import { useSlideCommands } from '../ai/bridge'
import s from './Slides.module.css'

/* ---------- paket usuli ---------- */
const MD_A = 50 // ming so‘m
const MD_B = 30
const FIXED = 380 // mln

export function Package() {
  const [mix, setMix] = useState({ a: 2, b: 3 })
  const bump = (k: 'a' | 'b', d: number) => setMix((p) => ({ ...p, [k]: Math.max(0, Math.min(9, p[k] + d)) }))

  useSlideCommands('package', (a) => {
    const cl = (x: unknown, d: number) => (typeof x === 'number' ? Math.max(0, Math.min(9, Math.round(x))) : d)
    const m = { a: cl(a.a_units, mix.a), b: cl(a.b_units, mix.b) }
    setMix(m)
    const pm = m.a * MD_A + m.b * MD_B
    const pk = pm > 0 ? (FIXED * 1e3) / pm : 0
    return { mix: `${m.a}:${m.b}`, package_md_thousand: pm, breakeven_packages: pk, a_units: pk * m.a, b_units: pk * m.b, fixed_mln: FIXED }
  })

  const pkgMd = mix.a * MD_A + mix.b * MD_B // ming
  const packs = pkgMd > 0 ? (FIXED * 1e3) / pkgMd : 0
  const units = mix.a + mix.b
  const avgMd = units > 0 ? pkgMd / units : 0
  const base = packs > 0 && mix.a === 2 && mix.b === 3

  const chain = [
    { no: '01', name: 'Sotuv tarkibi', value: `A : B = ${mix.a} : ${mix.b}` },
    { no: '02', name: 'Paket MD', value: `${mix.a} × ${MD_A} + ${mix.b} × ${MD_B} = ${fmt(pkgMd)} ming` },
    { no: '03', name: 'Zararsizlik paketi', value: pkgMd > 0 ? `${FIXED} mln ÷ ${fmt(pkgMd)} ming = ${fmt(packs)} paket` : '—' },
    { no: '04', name: 'Mahsulot hajmi', value: pkgMd > 0 ? `A ${fmt(packs * mix.a)} · B ${fmt(packs * mix.b)} dona` : '—' },
  ]

  return (
    <Frame
      kicker="Ko‘p mahsulot · Paket usuli"
      title="Ko‘p mahsulotli CVP shartli paketdan boshlanadi"
      lead="Bir nechta mahsulotda zararsizlik sotuv tarkibi bo‘yicha «paket» orqali hisoblanadi. Tarkibni o‘zgartiring — nuqta siljiydi."
    >
      <div className={s.colsMix}>
        <div className={s.stack}>
          <div className={s.mixCards}>
            {(['a', 'b'] as const).map((k) => (
              <div key={k} className={s.mixCard}>
                <span className={s.label}>{k.toUpperCase()} mahsulot</span>
                <span className={s.mixMd}>
                  MD {k === 'a' ? MD_A : MD_B} <small>ming so‘m/dona</small>
                </span>
                <span className={s.stepper}>
                  <button onClick={() => bump(k, -1)} aria-label={`${k.toUpperCase()} ulushini kamaytirish`}>
                    <Icon id="minus" size={16} />
                  </button>
                  <output>{mix[k]}</output>
                  <button onClick={() => bump(k, 1)} aria-label={`${k.toUpperCase()} ulushini oshirish`}>
                    <Icon id="plus" size={16} />
                  </button>
                </span>
                <span className={s.tileSub}>paketdagi dona</span>
              </div>
            ))}
          </div>
          <ol className={s.calcSteps}>
            {chain.map((c) => (
              <li key={c.no}>
                <span className={s.stageNo}>{c.no}</span>
                <span className={s.calcName}>{c.name}</span>
                <span className={s.calcValue}>{c.value}</span>
              </li>
            ))}
          </ol>
        </div>
        <aside className={s.readout}>
          <p className={s.label}>Zararsizlik paketlari</p>
          <p className={s.bigNum}>
            {pkgMd > 0 ? fmt(packs) : '—'} <small>paket</small>
          </p>
          <dl className={s.kpis2}>
            <div>
              <dt>O‘rtacha tortilgan MD</dt>
              <dd>
                {fmt(avgMd, 1)} <small>ming/dona</small>
              </dd>
            </div>
            <div>
              <dt>Jami dona</dt>
              <dd>
                {pkgMd > 0 ? fmt(packs * units) : '—'} <small>dona</small>
              </dd>
            </div>
          </dl>
          <p className={s.insight}>
            <b>{base ? 'Qaror' : 'Tarkib o‘zgardi'}</b>
            {base
              ? 'Sotuv tarkibi o‘zgarsa paket va zararsizlikni qayta hisoblang.'
              : avgMd > 38
                ? 'Yuqori MDli A ulushi oshdi — o‘rtacha MD ko‘tarilib, zararsizlik hajmi kamaydi.'
                : 'Yuqori MDli A ulushi kamaydi — o‘rtacha tortilgan MD pasayib, zararsizlik hajmi oshdi.'}
          </p>
          {!base && (
            <div className={s.stageReset}>
              <button className={s.ghostBtn} onClick={() => setMix({ a: 2, b: 3 })}>
                2 : 3 tarkibiga qaytish
              </button>
            </div>
          )}
        </aside>
      </div>
    </Frame>
  )
}

/* ---------- cheklangan resurs ---------- */
const PRODUCTS = [
  { id: 'A', md: 50, hours: 5 },
  { id: 'B', md: 36, hours: 3 },
  { id: 'C', md: 28, hours: 4 },
].map((p) => ({ ...p, perHour: p.md / p.hours }))

const RANKED = [...PRODUCTS].sort((a, b) => b.perHour - a.perHour)
const MAX_PH = Math.max(...PRODUCTS.map((p) => p.perHour))

export function Resource() {
  const [sel, setSel] = useState('B')

  useSlideCommands('resource', (a) => {
    const id = typeof a.product === 'string' && PRODUCTS.some((p) => p.id === a.product) ? a.product : sel
    setSel(id)
    const p = PRODUCTS.find((x) => x.id === id)!
    return { product: id, unit_md_thousand: p.md, hours: p.hours, md_per_hour_thousand: p.perHour, rank: RANKED.findIndex((r) => r.id === id) + 1, priority: RANKED.map((r) => r.id).join(' → ') }
  })
  const cur = PRODUCTS.find((p) => p.id === sel)!
  const rank = RANKED.findIndex((p) => p.id === sel) + 1

  return (
    <Frame
      kicker="Ko‘p mahsulot · Cheklangan resurs"
      title="Cheklangan resursda birlik MD emas, resursga MD hal qiladi"
      lead="Mashina-soat cheklangan. Birlik MD bo‘yicha A eng yaxshi ko‘rinadi, lekin har soat resurs B mahsulotda ko‘proq MD beradi."
    >
      <div className={s.colsChart}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Mahsulot</th>
              <th>Birlik MD, ming</th>
              <th>Resurs sarfi, soat</th>
              <th>MDga soat, ming/soat</th>
              <th>Ustuvorlik</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.id} className={sel === p.id ? s.rowOn : ''} onClick={() => setSel(p.id)} onMouseEnter={() => setSel(p.id)}>
                <th>{p.id} mahsulot</th>
                <td>{p.md}</td>
                <td>{p.hours}</td>
                <td>
                  <span className={s.cellBar}>
                    <i style={{ width: `${(p.perHour / MAX_PH) * 100}%` }} />
                    {p.perHour}
                  </span>
                </td>
                <td>
                  <span className={s.rankChip}>{RANKED.findIndex((r) => r.id === p.id) + 1}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}>Resursga MD = birlik MD ÷ bir donaga resurs sarfi</td>
            </tr>
          </tfoot>
        </table>

        <aside className={s.readout}>
          <p className={s.label}>Tanlangan mahsulot</p>
          <p className={s.readoutName}>{cur.id} mahsulot</p>
          <p className={s.bigNum}>
            {cur.perHour} <small>ming so‘m / soat</small>
          </p>
          <p className={s.readoutNote}>
            {cur.md} ming ÷ {cur.hours} soat. Ustuvorlikda <b>{rank}-o‘rin</b>.
          </p>
          <div className={s.chainSmall}>
            {RANKED.map((p, i) => (
              <span key={p.id} className={s.chainItem}>
                <b className={p.id === sel ? s.chainOn : ''}>{p.id}</b>
                {i < RANKED.length - 1 && <Icon id="right" size={16} className={s.stepArrow} />}
              </span>
            ))}
          </div>
          <p className={s.insight}>
            <b>Qaror</b>
            Avval B talabi to‘liq qondiriladi, so‘ng A, oxirida C mahsulotlari ishlab chiqariladi.
          </p>
        </aside>
      </div>
    </Frame>
  )
}
