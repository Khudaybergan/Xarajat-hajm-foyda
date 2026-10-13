/* ============================================================
   Drill-down xarajatlar xaritasi.

   Ildiz: markazda «Xarajatlar», atrofida — tasnif guruhlari.
   Guruhni bosganda u markazga o‘tadi va ichidagi xarajat turlari
   ochiladi; barg va markaz panelni ochadi.
   Qaytish — yo‘l tugmalari, ← yoki Esc.
   ============================================================ */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CostNode } from '../data/tree'
import { Icon } from '../lib/icons'
import s from './Map.module.css'

const VB_W = 1240
const VB_H = 660
const CX = VB_W / 2
const CY = 330
const EASE = 'cubic-bezier(.22,.61,.24,1)'

interface NodeLayout {
  n: CostNode
  x: number
  y: number
  r: number
  /** Aloqa chizig‘i qalinligi — ichida ko‘proq tur bo‘lgan guruhda yo‘g‘onroq */
  ew: number
  edge: string
  pulseDur: number
}

/** Daraja joylashuvi: bitta radial halqa */
function layoutLevel(focus: CostNode): NodeLayout[] {
  const kids = focus.children ?? []
  const c = kids.length
  const rx = c <= 3 ? 300 : c <= 4 ? 350 : c <= 5 ? 405 : c <= 6 ? 450 : c <= 8 ? 495 : 512
  const ry = c <= 3 ? 168 : c <= 4 ? 192 : c <= 5 ? 216 : c <= 6 ? 232 : c <= 8 ? 240 : 250
  const baseR = c <= 8 ? 37 : 31
  const step = 360 / Math.max(c, 1)
  const start = c === 2 ? 0 : -90
  const k = c <= 8 ? 0.08 : 0.05
  const counts = kids.map((n) => n.children?.length ?? 0)
  const maxCount = Math.max(...counts, 1)
  const weighted = maxCount > 1
  return kids.map((n, i) => {
    const a = ((start + step * i) * Math.PI) / 180
    const x = CX + rx * Math.cos(a)
    const y = CY + ry * Math.sin(a)
    const w = weighted ? (counts[i] / maxCount) ** 0.55 : 0
    const r = baseR - 2 + w * 9
    const mx = (x + CX) / 2 + (CY - y) * k
    const my = (y + CY) / 2 + (x - CX) * k
    const edge = `M${x.toFixed(1)},${y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${CX},${CY}`
    return { n, x, y, r, ew: 1.2 + w * 2.6, edge, pulseDur: 2.4 + (i % 4) * 0.45 }
  })
}

/** Nomni satrlarga bo‘lish (markaz va tugun yozuvlari uchun) */
function wrapName(t: string, max = 14): string[] {
  const lines: string[] = []
  let cur = ''
  for (const w of t.split(' ')) {
    if (cur && (cur + ' ' + w).length > max) {
      lines.push(cur)
      cur = w
    } else {
      cur = cur ? cur + ' ' + w : w
    }
  }
  if (cur) lines.push(cur)
  return lines.slice(0, 4)
}

interface Props {
  root: CostNode
  /** Tugun panelini ochish; path — ildizdan tugungacha yo‘l */
  onOpenNode: (node: CostNode, path: CostNode[]) => void
  panelOpen: boolean
}

export function OrbitMap({ root, onOpenNode, panelOpen }: Props) {
  const [path, setPath] = useState<CostNode[]>([root])
  const [hover, setHover] = useState<string | null>(null)
  const layerRef = useRef<SVGGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const busy = useRef(false)

  const focus = path[path.length - 1]
  const depth = path.length - 1
  const atRoot = depth === 0
  const ring = useMemo(() => layoutLevel(focus), [focus])
  const hoveredL = hover && hover !== 'core' ? ring.find((l) => l.n.id === hover) : null

  const stateOf = (id: string) => {
    if (!hover) return ''
    if (hover === 'core') return s.rel
    return id === hover ? s.hot : s.dim
  }

  /* ---------- darajalar orasidagi o‘tishlar ---------- */
  const animate = (out: { origin: string; scale: number }, swap: () => void, inFrom: number) => {
    const el = layerRef.current
    if (!el || busy.current) return
    setHover(null)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      swap()
      return
    }
    busy.current = true
    el.style.transformOrigin = out.origin
    el.style.transition = `transform .3s ${EASE}, opacity .3s ${EASE}`
    el.style.transform = `scale(${out.scale})`
    el.style.opacity = '0'
    window.setTimeout(() => {
      swap()
      el.style.transition = 'none'
      el.style.transformOrigin = `${CX}px ${CY}px`
      el.style.transform = `scale(${inFrom})`
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          el.style.transition = `transform .36s ${EASE}, opacity .36s ${EASE}`
          el.style.transform = 'scale(1)'
          el.style.opacity = '1'
          window.setTimeout(() => {
            el.style.cssText = ''
            busy.current = false
          }, 380)
        }),
      )
    }, 300)
  }

  const drill = (l: NodeLayout) => {
    if (!l.n.children?.length) {
      onOpenNode(l.n, [...path, l.n])
      return
    }
    animate({ origin: `${l.x}px ${l.y}px`, scale: 1.9 }, () => setPath((p) => [...p, l.n]), 0.82)
    wrapRef.current?.focus({ preventScroll: true })
  }

  const upTo = (index: number) => {
    if (index >= depth) return
    animate({ origin: `${CX}px ${CY}px`, scale: 0.78 }, () => setPath((p) => p.slice(0, index + 1)), 1.7)
    wrapRef.current?.focus({ preventScroll: true })
  }

  // Esc — yuqori darajaga (panel yopiq bo‘lganda)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !panelOpen && depth > 0) upTo(depth - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen, depth, path])

  const activate = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  }

  const centerLines = wrapName(focus.label ?? focus.name, 13)

  return (
    <div ref={wrapRef} className={s.mapWrap} tabIndex={-1}>
      {/* yo‘l */}
      {depth > 0 && (
        <nav className={s.crumbs} aria-label="Darajalar bo‘yicha yo‘l">
          <button className={s.backBtn} onClick={() => upTo(depth - 1)} aria-label="Yuqori darajaga">
            ←
          </button>
          {path.map((n, i) => (
            <span key={n.id} className={s.crumbItem}>
              {i > 0 && <span className={s.crumbSep}>›</span>}
              {i < depth ? (
                <button className={s.crumb} onClick={() => upTo(i)}>
                  {n.label ?? n.name}
                </button>
              ) : (
                <span className={`${s.crumb} ${s.crumbCur}`}>{n.label ?? n.name}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <svg
        className={s.mapSvg}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="group"
        aria-label={`Xarajatlar xaritasi, daraja: ${focus.name}. Markaz atrofida ${ring.length} ta tugun`}
      >
        <defs>
          <radialGradient id="coreDisc" cx="50%" cy="38%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fbfaf7" />
          </radialGradient>
        </defs>

        <g ref={layerRef} className={s.zoomLayer}>
          {/* orbita yo‘naltirgichi */}
          {ring.length > 0 && (
            <ellipse
              className={s.orbit}
              cx={CX}
              cy={CY}
              rx={Math.max(...ring.map((l) => Math.abs(l.x - CX)))}
              ry={Math.max(...ring.map((l) => Math.abs(l.y - CY)), 150)}
            />
          )}

          {/* aloqalar + pulslar: markazdan tashqariga — xarajat turlarga ajraladi */}
          {ring.map((l, i) => (
            <g
              key={l.n.id}
              className={`${s.edgeGroup} ${stateOf(l.n.id)}`}
              style={{ '--ew': `${l.ew.toFixed(1)}px` } as React.CSSProperties}
            >
              <path id={`edge-${l.n.id}`} className={s.edge} d={l.edge} />
              <g className={s.pulses}>
                {[0, 1].map((j) => (
                  <circle key={j} className={s.pulseDot} r={l.r > 36 ? 3.2 : 2.7}>
                    <animateMotion
                      dur={`${l.pulseDur + j * 0.7}s`}
                      begin={`${(-(i * 0.53) - j * (l.pulseDur / 2)).toFixed(2)}s`}
                      repeatCount="indefinite"
                      keyPoints="1;0"
                      keyTimes="0;1"
                    >
                      <mpath href={`#edge-${l.n.id}`} />
                    </animateMotion>
                  </circle>
                ))}
              </g>
            </g>
          ))}

          {/* markaz — joriy tugun */}
          <g
            className={s.core}
            role="button"
            tabIndex={0}
            aria-label={`${focus.name} — panelni ochish`}
            onMouseEnter={() => setHover('core')}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover('core')}
            onBlur={() => setHover(null)}
            onClick={() => onOpenNode(focus, path)}
            onKeyDown={activate(() => onOpenNode(focus, path))}
          >
            <circle className={s.coreDash} cx={CX} cy={CY} r={99} />
            <circle className={s.coreRule} cx={CX} cy={CY} r={92} />
            <circle className={s.coreDiscC} cx={CX} cy={CY} r={84} fill="url(#coreDisc)" />
            <g className={s.coreContent} transform={`translate(${CX}, ${CY})`}>
              {atRoot ? (
                <>
                  <g transform="translate(-21, -58)" className={s.coreIcon}>
                    <Icon id={root.icon ?? 'coins'} size={42} />
                  </g>
                  <text className={s.coreTitle} y="16" textAnchor="middle">
                    {root.name}
                  </text>
                  {root.coreMeta && (
                    <text className={s.coreMeta} y="40" textAnchor="middle">
                      {root.coreMeta}
                    </text>
                  )}
                </>
              ) : (
                centerLines.map((line, i) => {
                  const sp = centerLines.length >= 4 ? 17 : 20
                  return (
                    <text
                      key={i}
                      className={`${s.coreName} ${centerLines.length >= 4 ? s.coreNameSm : ''}`}
                      y={6 + i * sp - ((centerLines.length - 1) * sp) / 2}
                      textAnchor="middle"
                    >
                      {line}
                    </text>
                  )
                })
              )}
            </g>
          </g>

          {/* daraja tugunlari */}
          {ring.map((l) => {
            const lines = wrapName(l.n.label ?? l.n.name, 17).slice(0, 3)
            return (
              <g
                key={l.n.id}
                className={`${s.node} ${stateOf(l.n.id)}`}
                transform={`translate(${l.x.toFixed(1)}, ${l.y.toFixed(1)})`}
                role="button"
                tabIndex={0}
                aria-label={`${l.n.name}. ${l.n.desc} ${l.n.children?.length ? `Ichida ${l.n.children.length} ta tur.` : ''}`}
                onMouseEnter={() => setHover(l.n.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(l.n.id)}
                onBlur={() => setHover(null)}
                onClick={() => drill(l)}
                onKeyDown={activate(() => drill(l))}
              >
                <g className={s.nodeScale}>
                  <circle className={s.nodeHalo} r={l.r + 12} />
                  <circle className={s.nodeBody} r={l.r} />
                  {l.n.icon ? (
                    <g transform={`translate(${-l.r * 0.56}, ${-l.r * 0.56})`} className={s.nodeIcon}>
                      <Icon id={l.n.icon} size={l.r * 1.12} />
                    </g>
                  ) : (
                    <g className={s.nodeGlyph}>
                      <circle r="9" fill="none" strokeWidth="1.8" />
                      <circle r="2.8" stroke="none" />
                    </g>
                  )}
                  {l.n.children?.length ? (
                    <g transform={`translate(${l.r * 0.74}, ${-l.r * 0.74})`}>
                      <circle className={s.nodeBadge} r="11.5" />
                      <text className={s.nodeBadgeText} textAnchor="middle" dy="4">
                        {l.n.children.length}
                      </text>
                    </g>
                  ) : null}
                  <text
                    className={`${s.nodeLabel} ${lines.length > 1 ? s.nodeLabelMulti : ''}`}
                    y={l.r + 23}
                    textAnchor="middle"
                  >
                    {lines.map((ln, i) => (
                      <tspan key={i} x="0" dy={i === 0 ? 0 : 16}>
                        {ln}
                      </tspan>
                    ))}
                  </text>
                </g>
              </g>
            )
          })}
        </g>
      </svg>

      {/* hover-kartochka */}
      {hoveredL && (
        <div
          className={`${s.tip} ${hoveredL.x > CX ? s.tipLeft : s.tipRight} ${hoveredL.y < 200 ? s.tipBelow : ''} ${hoveredL.y > 480 ? s.tipAbove : ''}`}
          style={{ left: `${(hoveredL.x / VB_W) * 100}%`, top: `${(hoveredL.y / VB_H) * 100}%` }}
          aria-hidden="true"
        >
          <span className={s.tipName}>{hoveredL.n.name}</span>
          <span className={s.tipText}>{hoveredL.n.desc}</span>
          <span className={s.tipCta}>
            {hoveredL.n.children?.length ? `Ichida ${hoveredL.n.children.length} ta tur · kirish →` : 'Batafsil →'}
          </span>
        </div>
      )}
    </div>
  )
}
