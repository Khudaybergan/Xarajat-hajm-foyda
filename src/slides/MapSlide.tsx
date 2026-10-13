/* Markaziy slayd: CVP ko‘rsatkichlarining interaktiv xaritasi.
   Rejimlar: ko‘rsatkichlar — sakkiz tushuncha; ta’sir — parametr o‘zgarishi. */
import { useCallback, useState } from 'react'
import { CVP_ROOT, TASIR_ROOT, type CostNode, type PanelBlock } from '../data/tree'
import { OrbitMap } from '../map/OrbitMap'
import { Panel, type PanelData } from '../map/Panel'
import { Seg } from './Frame'
import { useSlideCommands } from '../ai/bridge'
import s from './Slides.module.css'

/** Tugun uchun panel: tayyor bloklar yoki tarkibidan generatsiya */
function panelFromNode(node: CostNode, path: CostNode[]): PanelData {
  const blocks: PanelBlock[] = []
  if (node.panel) blocks.push(...node.panel)
  if (node.children?.length) {
    blocks.push({ kind: 'list', title: 'Tarkibi', items: node.children.map((c) => c.name) })
  }
  return {
    key: node.id,
    name: node.name,
    tagline: node.desc,
    indexLabel: path.map((n) => n.label ?? n.name).join(' / '),
    blocks,
  }
}

const MODES = [
  { id: 'cvp', label: 'Ko‘rsatkichlar', root: CVP_ROOT, hint: 'Ko‘rsatkichni bosing — formulasi va misoli ochiladi' },
  { id: 'tasir', label: 'Parametr ta’siri', root: TASIR_ROOT, hint: 'Parametrni bosing — MD va zararsizlikka ta’siri ochiladi' },
] as const

export function MapSlide() {
  const [mode, setMode] = useState<(typeof MODES)[number]['id']>('cvp')
  const [panel, setPanel] = useState<PanelData | null>(null)
  const active = MODES.find((m) => m.id === mode)!
  const openNode = useCallback((node: CostNode, path: CostNode[]) => setPanel(panelFromNode(node, path)), [])
  const closePanel = useCallback(() => setPanel(null), [])

  useSlideCommands('map', (a) => {
    const m = a.mode === 'tasir' ? 'tasir' : a.mode === 'cvp' ? 'cvp' : null
    const node = typeof a.node === 'string' ? a.node : null
    const roots = [CVP_ROOT, TASIR_ROOT]
    const found = node ? roots.map((r) => ({ r, n: r.children?.find((c) => c.id === node) })).find((x) => x.n) : null
    const nextMode = found ? (found.r === TASIR_ROOT ? 'tasir' : 'cvp') : (m ?? mode)
    setMode(nextMode)
    if (found?.n) {
      const data = panelFromNode(found.n, [found.r, found.n])
      // rejim almashganda xarita qayta chiziladi — panelni keyin ochamiz
      window.setTimeout(() => setPanel(data), nextMode === mode ? 0 : 120)
      return { mode: nextMode, node: found.n.id, name: found.n.name, summary: found.n.desc, blocks: data.blocks }
    }
    setPanel(null)
    const root = nextMode === 'tasir' ? TASIR_ROOT : CVP_ROOT
    return { mode: nextMode, nodes: root.children?.map((c) => ({ id: c.id, name: c.name })) }
  })

  return (
    <section className={s.mapSlide}>
      <header className={s.mapHead}>
        <div>
          <p className={s.kicker}>Model · Interaktiv xarita</p>
          <h2 className={s.mapTitle}>CVP tahlilining ko‘rsatkichlar xaritasi</h2>
        </div>
        <div className={s.mapTools}>
          <span className={s.mapHint}>{active.hint}</span>
          <Seg label="Xarita rejimi" options={MODES} value={mode} onChange={setMode} />
        </div>
      </header>
      <OrbitMap key={mode} root={active.root} onOpenNode={openNode} panelOpen={panel !== null} />
      <Panel data={panel} onClose={closePanel} />
    </section>
  )
}
