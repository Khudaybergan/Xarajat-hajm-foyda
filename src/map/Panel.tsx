import { useEffect } from 'react'
import type { PanelBlock } from '../data/tree'
import { Icon } from '../lib/icons'
import s from './Map.module.css'

/** Panel ma’lumoti: tayyor bloklar yoki tugundan generatsiya qilingan */
export interface PanelData {
  key: string
  name: string
  tagline: string
  /** Sarlavha ustidagi yo‘l: «Xarajatlar / Toifalar / Mehnat» */
  indexLabel: string
  blocks: PanelBlock[]
}

function Block({ b }: { b: PanelBlock }) {
  switch (b.kind) {
    case 'text':
      return <p className={s.blockText}>{b.body}</p>
    case 'list':
      return (
        <div>
          <h4 className={s.blockTitle}>{b.title}</h4>
          <ul className={s.blockList}>
            {b.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      )
    case 'example':
      return (
        <p className={s.blockExample}>
          <b>Misol</b>
          {b.body}
        </p>
      )
    case 'formula':
      return (
        <div className={s.blockFormula}>
          <strong>{b.body}</strong>
          {b.note && <span>{b.note}</span>}
        </div>
      )
  }
}

interface Props {
  data: PanelData | null
  onClose: () => void
}

export function Panel({ data, onClose }: Props) {
  useEffect(() => {
    if (!data) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [data, onClose])

  if (!data) return null
  return (
    <>
      <div className={s.scrim} onClick={onClose} aria-hidden="true" />
      <aside key={data.key} className={s.panel} role="dialog" aria-label={data.name}>
        <header className={s.panelHead}>
          <div className={s.panelTop}>
            <p className={s.panelIndex}>{data.indexLabel}</p>
            <button className={s.panelClose} onClick={onClose} aria-label="Panelni yopish">
              <Icon id="close" size={18} />
            </button>
          </div>
          <h3 className={s.panelName}>{data.name}</h3>
          <p className={s.panelTagline}>{data.tagline}</p>
        </header>
        <div className={s.panelBody}>
          {data.blocks.map((b, i) => (
            <Block key={i} b={b} />
          ))}
        </div>
      </aside>
    </>
  )
}
