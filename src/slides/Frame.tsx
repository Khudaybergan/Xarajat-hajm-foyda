import type { ReactNode } from 'react'
import s from './Slides.module.css'

export interface SlideProps {
  /** Keyingi slaydga o‘tish */
  next: () => void
}

interface FrameProps {
  /** Sarlavha ustidagi mono-satr */
  kicker: string
  title: string
  lead?: string
  children: ReactNode
}

/** Slaydning umumiy qolipi: mono-satr, sarlavha, kirish gapi va mazmun */
export function Frame({ kicker, title, lead, children }: FrameProps) {
  return (
    <section className={s.frame}>
      <header>
        <p className={s.kicker}>{kicker}</p>
        <h2 className={s.title}>{title}</h2>
        {lead && <p className={s.lead}>{lead}</p>}
      </header>
      <div className={s.body}>{children}</div>
    </section>
  )
}

interface SegProps<T extends string> {
  label: string
  options: readonly { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}

/** Segmentli tanlagich (rasmiy uslubdagi tablar) */
export function Seg<T extends string>({ label, options, value, onChange }: SegProps<T>) {
  return (
    <div className={s.seg} role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={value === o.id}
          className={`${s.segBtn} ${value === o.id ? s.segOn : ''}`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
