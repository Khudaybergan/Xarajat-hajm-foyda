/* ============================================================
   Taqdimot qobig‘i: 1600×900 sahna (ekranga moslab masshtablanadi),
   slaydlar orasida o‘tish, mundarija va to‘liq ekran rejimi.

   Klaviatura: ← → / PgUp PgDn / Probel — slaydlar, Home / End,
   F — to‘liq ekran, M — mundarija, Esc — yopish.
   ============================================================ */
import { useCallback, useEffect, useState } from 'react'
import { MAIN_COUNT, SLIDES } from '../slides'
import { Icon } from '../lib/icons'
import { Assistant } from '../ai/Assistant'
import { registerNav } from '../ai/bridge'
import s from './Deck.module.css'

const STAGE_W = 1600
const STAGE_H = 900

const clamp = (n: number) => Math.max(0, Math.min(SLIDES.length - 1, n))
const pad = (n: number) => String(n).padStart(2, '0')

function readHash(): number {
  const n = parseInt(window.location.hash.replace('#', ''), 10)
  return Number.isFinite(n) ? clamp(n - 1) : 0
}

/** Sahna masshtabi: ekranga to‘liq sig‘adigan eng katta o‘lcham */
function useStageScale(): number {
  const get = () => Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H)
  const [k, setK] = useState(get)
  useEffect(() => {
    const on = () => setK(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return k
}

function toggleFullscreen() {
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }
  const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void }
  if (document.fullscreenElement || doc.webkitFullscreenElement) {
    if (document.exitFullscreen) void document.exitFullscreen()
    else doc.webkitExitFullscreen?.()
  } else if (el.requestFullscreen) {
    el.requestFullscreen().catch(() => {})
  } else {
    el.webkitRequestFullscreen?.()
  }
}

export function Deck() {
  const [pos, setPos] = useState(() => ({ i: readHash(), dir: 1 }))
  const [overview, setOverview] = useState(false)
  const [isFs, setIsFs] = useState(false)
  const [assistant, setAssistant] = useState(false)
  const scale = useStageScale()

  const { i, dir } = pos
  const slide = SLIDES[i]

  const go = useCallback((n: number) => {
    setPos((p) => {
      const t = clamp(n)
      return t === p.i ? p : { i: t, dir: t > p.i ? 1 : -1 }
    })
    setOverview(false)
  }, [])
  // asosiy oqim «Rahmat»da to‘xtaydi; zaxira slaydlar ichida — oxirigacha
  const next = useCallback(
    () => setPos((p) => (p.i !== MAIN_COUNT - 1 && p.i < SLIDES.length - 1 ? { i: p.i + 1, dir: 1 } : p)),
    [],
  )
  const prev = useCallback(() => setPos((p) => (p.i > 0 ? { i: p.i - 1, dir: -1 } : p)), [])

  useEffect(() => {
    window.history.replaceState(null, '', `#${i + 1}`)
  }, [i])

  // yordamchi uchun navigatsiya ko‘prigi
  useEffect(() => {
    registerNav({
      goTo: (id) => {
        const n = SLIDES.findIndex((sl) => sl.id === id)
        if (n < 0) return false
        go(n)
        return true
      },
      current: () => ({ id: slide.id, title: slide.title, section: slide.section, index: i }),
    })
    return () => registerNav(null)
  }, [go, slide, i])

  useEffect(() => {
    const on = () => setIsFs(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', on)
    document.addEventListener('webkitfullscreenchange', on)
    return () => {
      document.removeEventListener('fullscreenchange', on)
      document.removeEventListener('webkitfullscreenchange', on)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target instanceof Element ? e.target : null
      // maydon ichida yozilayotganda yoki slayder surilayotganda slayd almashmaydi
      if (t?.closest('input, textarea, select')) return
      const onControl = Boolean(t?.closest('button, a, [role="button"], [role="tab"]'))
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          prev()
          break
        case ' ':
          if (onControl) return
          e.preventDefault()
          if (e.shiftKey) prev()
          else next()
          break
        case 'Home':
          go(0)
          break
        case 'End':
          go(MAIN_COUNT - 1)
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'm':
        case 'M':
          setOverview((v) => !v)
          break
        case 'a':
        case 'A':
          setAssistant((v) => !v)
          break
        case 'Escape':
          setOverview(false)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, go])

  const Current = slide.Component

  return (
    <div className={s.viewport}>
      <div className={s.stage} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <header className={s.top}>
          <span className={s.brand}>
            <i className={s.brandMark} aria-hidden="true" />
            Boshqaruv hisobi
          </span>
          <span className={s.topic}>«Xarajat–hajm–foyda» tahlili</span>
          <span className={s.section}>{slide.section}</span>
        </header>

        <main className={`${s.slideArea} ${assistant ? s.slideShrunk : ''}`}>
          <div key={slide.id} className={`${s.slide} ${dir < 0 ? s.fromLeft : ''}`}>
            <Current next={next} />
          </div>
        </main>

        <footer className={s.bar}>
          <div className={s.navGroup}>
            <button className={s.iconBtn} onClick={prev} disabled={i === 0} aria-label="Oldingi slayd" title="Oldingi (←)">
              <Icon id="left" size={20} />
            </button>
            <span className={s.counter} aria-live="polite">
              {i < MAIN_COUNT ? (
                <>
                  <b>{pad(i + 1)}</b> / {pad(MAIN_COUNT)}
                </>
              ) : (
                <>
                  <b>Q{i - MAIN_COUNT + 1}</b> / {SLIDES.length - MAIN_COUNT}
                </>
              )}
            </span>
            <button
              className={s.iconBtn}
              onClick={next}
              disabled={i === MAIN_COUNT - 1 || i === SLIDES.length - 1}
              aria-label="Keyingi slayd"
              title="Keyingi (→)"
            >
              <Icon id="right" size={20} />
            </button>
          </div>

          <nav className={s.progress} aria-label="Slaydlar">
            {SLIDES.slice(0, MAIN_COUNT).map((sl, n) => (
              <button
                key={sl.id}
                className={`${s.tick} ${n < i ? s.tickDone : ''} ${n === i ? s.tickOn : ''}`}
                onClick={() => go(n)}
                aria-label={`${n + 1}-slayd: ${sl.title}`}
                aria-current={n === i ? 'step' : undefined}
                title={`${pad(n + 1)} · ${sl.title}`}
              />
            ))}
          </nav>

          <div className={s.tools}>
            <button className={s.textBtn} onClick={() => setAssistant((v) => !v)} aria-pressed={assistant} title="Yordamchi (A)">
              <Icon id="chat" size={18} />
              Yordamchi
            </button>
            <button className={s.textBtn} onClick={() => setOverview((v) => !v)} aria-pressed={overview} title="Mundarija (M)">
              <Icon id="tiles" size={18} />
              Mundarija
            </button>
            <button className={s.textBtn} onClick={toggleFullscreen} aria-pressed={isFs} title="To‘liq ekran (F)">
              <Icon id={isFs ? 'compress' : 'expand'} size={18} />
              {isFs ? 'Chiqish' : 'To‘liq ekran'}
            </button>
          </div>
        </footer>

        <Assistant open={assistant} onClose={() => setAssistant(false)} />

        {overview && (
          <div className={s.overview} role="dialog" aria-label="Mundarija">
            <div className={s.overviewHead}>
              <h2 className={s.overviewTitle}>Mundarija</h2>
              <button className={s.iconBtn} onClick={() => setOverview(false)} aria-label="Mundarijani yopish">
                <Icon id="close" size={18} />
              </button>
            </div>
            {[SLIDES.slice(0, MAIN_COUNT), SLIDES.slice(MAIN_COUNT)].map((group, g) => group.length > 0 && (
              <div key={g}>
                {g === 1 && <h3 className={s.overviewSub}>Qo‘shimcha slaydlar — savol-javob uchun</h3>}
                <ol className={s.overviewGrid}>
                  {group.map((sl, k) => {
                    const n = g * MAIN_COUNT + k
                    return (
                      <li key={sl.id}>
                        <button className={`${s.ovCard} ${n === i ? s.ovOn : ''}`} onClick={() => go(n)}>
                          <span className={s.ovNo}>{g === 0 ? pad(n + 1) : `Q${k + 1}`}</span>
                          <span className={s.ovTitle}>{sl.title}</span>
                          <span className={s.ovSection}>{sl.section}</span>
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
