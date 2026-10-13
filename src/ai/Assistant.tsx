/* ============================================================
   Yordamchi paneli: Gemini Live bilan ovozli/matnli muloqot,
   transkript, API kalit va ovoz sozlamalari.
   ============================================================ */
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Icon } from '../lib/icons'
import { LiveAssistant, MODEL, VOICES, type LiveState } from './live'
import { executeFunction } from './tools'
import s from './Assistant.module.css'

const KEY_STORAGE = 'cvp-gemini-key'
/** .env faylidagi VITE_GEMINI_API_KEY — build vaqtida o‘rnatiladi */
const ENV_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() ?? ''

// sinov va avtomatlashtirish uchun: brauzer konsolidan funksiyalarni chaqirish
declare global {
  interface Window {
    __cvp?: { run: typeof executeFunction }
  }
}
window.__cvp = { run: executeFunction }
const VOICE_STORAGE = 'cvp-gemini-voice'

const SUGGESTIONS = ['Zararsizlik nuqtasi nima?', 'Narx 5 % pasaysa nima bo‘ladi?', '5 000 donada foyda qancha?', 'Reklama foydalimi?']

interface Props {
  open: boolean
  onClose: () => void
}

export function Assistant({ open, onClose }: Props) {
  const live = useMemo(() => new LiveAssistant(), [])
  const [st, setSt] = useState<LiveState>(live.state)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY_STORAGE) || ENV_KEY)
  const [voice, setVoice] = useState(() => localStorage.getItem(VOICE_STORAGE) ?? 'Kore')
  const [settings, setSettings] = useState(() => !(localStorage.getItem(KEY_STORAGE) || ENV_KEY).trim())
  const [text, setText] = useState('')
  const [level, setLevel] = useState(0)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => live.subscribe(setSt), [live])
  useEffect(() => () => live.disconnect(), [live])

  // mikrofon darajasi indikatori
  useEffect(() => {
    if (!st.micOn) {
      setLevel(0)
      return
    }
    const t = window.setInterval(() => setLevel(live.micLevel), 80)
    return () => window.clearInterval(t)
  }, [st.micOn, live])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [st.lines])

  const connect = () => {
    if (apiKey.trim() !== ENV_KEY) localStorage.setItem(KEY_STORAGE, apiKey.trim())
    localStorage.setItem(VOICE_STORAGE, voice)
    setSettings(false)
    void live.connect(apiKey.trim(), voice)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    live.sendText(t)
    setText('')
  }

  if (!open) return null
  const connected = st.status === 'ready'
  const needKey = settings

  return (
    <aside className={s.panel} role="dialog" aria-label="CVP yordamchisi">
      <header className={s.head}>
        <div>
          <p className={s.kicker}>Gemini Live · {MODEL}</p>
          <h3 className={s.title}>
            <span className={`${s.dot} ${s[`dot_${st.status}`]}`} aria-hidden="true" />
            CVP yordamchisi
          </h3>
        </div>
        <div className={s.headBtns}>
          <button className={s.iconBtn} onClick={() => setSettings((v) => !v)} aria-label="Sozlamalar" title="API kalit va ovoz">
            <Icon id="gear" size={18} />
          </button>
          <button className={s.iconBtn} onClick={onClose} aria-label="Yopish">
            <Icon id="close" size={18} />
          </button>
        </div>
      </header>

      {needKey ? (
        <form
          className={s.setup}
          onSubmit={(e) => {
            e.preventDefault()
            connect()
          }}
        >
          <label className={s.field}>
            <span className={s.label}>Gemini API kaliti</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza…"
              autoComplete="off"
              spellCheck={false}
            />
            <small>Kalit faqat shu brauzerda saqlanadi. Olish: aistudio.google.com → Get API key. Yoki .env faylida VITE_GEMINI_API_KEY.</small>
          </label>
          <label className={s.field}>
            <span className={s.label}>Ovoz</span>
            <select value={voice} onChange={(e) => setVoice(e.target.value)}>
              {VOICES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button className={s.primary} type="submit" disabled={!apiKey.trim()}>
            Ulanish
          </button>
        </form>
      ) : (
        <>
          <div ref={logRef} className={s.log}>
            {st.lines.length === 0 && (
              <div className={s.empty}>
                <p>
                  {st.status === 'idle' || st.status === 'closed'
                    ? 'Ulanib, mikrofonni yoqing yoki savolni yozing. Yordamchi javob beradi va kerakli slaydni ochadi.'
                    : st.status === 'connecting'
                      ? 'Ulanmoqda…'
                      : 'Savol bering — ovoz bilan yoki yozib.'}
                </p>
                <ul className={s.chips}>
                  {SUGGESTIONS.map((q) => (
                    <li key={q}>
                      <button
                        className={s.chip}
                        disabled={!connected}
                        onClick={() => live.sendText(q)}
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {st.lines.map((l) => (
              <div key={l.id} className={`${s.line} ${s[`line_${l.role}`]}`}>
                {l.role === 'tool' && <Icon id="right" size={14} />}
                <span>{l.text}</span>
              </div>
            ))}
            {st.speaking && <div className={s.speaking}>Yordamchi gapirmoqda…</div>}
          </div>

          {st.error && <p className={s.error}>{st.error}</p>}

          <div className={s.controls}>
            {!connected ? (
              <button className={s.primary} onClick={connect} disabled={st.status === 'connecting'}>
                {st.status === 'connecting' ? 'Ulanmoqda…' : st.status === 'closed' || st.status === 'error' ? 'Qayta ulanish' : 'Ulanish'}
              </button>
            ) : (
              <>
                <button
                  className={`${s.mic} ${st.micOn ? s.micOn : ''}`}
                  onClick={() => (st.micOn ? live.stopMic() : void live.startMic())}
                  aria-pressed={st.micOn}
                  title={st.micOn ? 'Mikrofonni o‘chirish' : 'Mikrofonni yoqish'}
                  style={{ '--lvl': level } as React.CSSProperties}
                >
                  <Icon id={st.micOn ? 'micOn' : 'mic'} size={22} />
                  <span>{st.micOn ? 'Tinglayapman' : 'Gapirish'}</span>
                </button>
                <form className={s.textForm} onSubmit={submit}>
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Savol yozing…" aria-label="Savol" />
                  <button type="submit" className={s.iconBtn} aria-label="Yuborish" disabled={!text.trim()}>
                    <Icon id="right" size={18} />
                  </button>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </aside>
  )
}
