/* ============================================================
   Gemini Live sessiyasi: ulanish, audio oqimi, transkripsiya,
   funksiya chaqiruvlari. UI holatini callback orqali yangilaydi.
   ============================================================ */
import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from '@google/genai'
import { MicCapture, PcmPlayer } from './audio'
import { SYSTEM_INSTRUCTION } from './knowledge'
import { executeFunction, FUNCTION_DECLARATIONS } from './tools'

export const MODEL = 'gemini-3.8-live'
export const VOICES = ['Kore', 'Puck', 'Charon', 'Aoede', 'Fenrir', 'Leda', 'Orus', 'Zephyr'] as const

export type Status = 'idle' | 'connecting' | 'ready' | 'error' | 'closed'

export interface Line {
  id: number
  role: 'user' | 'model' | 'tool' | 'system'
  text: string
  final: boolean
}

export interface LiveState {
  status: Status
  micOn: boolean
  speaking: boolean
  error: string | null
  lines: Line[]
}

type Listener = (s: LiveState) => void

export class LiveAssistant {
  private session: Session | null = null
  private mic = new MicCapture()
  private player = new PcmPlayer()
  private listeners = new Set<Listener>()
  private seq = 1
  private tick: number | null = null
  state: LiveState = { status: 'idle', micOn: false, speaking: false, error: null, lines: [] }

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }
  private emit(patch: Partial<LiveState>) {
    this.state = { ...this.state, ...patch }
    for (const fn of this.listeners) fn(this.state)
  }
  private push(role: Line['role'], text: string, final = true) {
    const line: Line = { id: this.seq++, role, text, final }
    this.emit({ lines: [...this.state.lines, line] })
    return line.id
  }
  /** Oxirgi tugallanmagan satrga matn qo‘shish (transkripsiya bo‘laklari) */
  private append(role: 'user' | 'model', text: string) {
    const lines = [...this.state.lines]
    const last = lines[lines.length - 1]
    if (last && last.role === role && !last.final) {
      lines[lines.length - 1] = { ...last, text: last.text + text }
      this.emit({ lines })
    } else {
      this.push(role, text, false)
    }
  }
  private finalize() {
    if (this.state.lines.some((l) => !l.final)) this.emit({ lines: this.state.lines.map((l) => ({ ...l, final: true })) })
  }

  async connect(apiKey: string, voice: string) {
    if (this.session) this.disconnect()
    this.emit({ status: 'connecting', error: null })
    const ai = new GoogleGenAI({ apiKey })
    try {
      this.session = await ai.live.connect({
        model: MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          contextWindowCompression: { slidingWindow: {} },
        },
        callbacks: {
          onopen: () => this.emit({ status: 'ready' }),
          onmessage: (m) => this.onMessage(m),
          onerror: (e) => this.emit({ status: 'error', error: e.message || 'Ulanish xatosi' }),
          onclose: (e) => {
            this.stopMic()
            this.emit({ status: this.state.status === 'error' ? 'error' : 'closed', error: this.state.error ?? (e.reason || null) })
            this.session = null
          },
        },
      })
      this.tick = window.setInterval(() => {
        const speaking = this.player.speaking
        if (speaking !== this.state.speaking) this.emit({ speaking })
      }, 150)
    } catch (err) {
      this.emit({ status: 'error', error: err instanceof Error ? err.message : String(err) })
    }
  }

  private onMessage(m: LiveServerMessage) {
    const sc = m.serverContent
    if (sc) {
      if (sc.interrupted) this.player.flush()
      if (sc.inputTranscription?.text) this.append('user', sc.inputTranscription.text)
      if (sc.outputTranscription?.text) this.append('model', sc.outputTranscription.text)
      for (const part of sc.modelTurn?.parts ?? []) {
        if (part.inlineData?.data) this.player.enqueue(part.inlineData.data)
      }
      if (sc.turnComplete) this.finalize()
    }
    if (m.toolCall?.functionCalls?.length) void this.runTools(m.toolCall.functionCalls)
    if (m.goAway) this.push('system', 'Sessiya tez orada yopiladi — qayta ulang.')
  }

  private async runTools(calls: { id?: string; name?: string; args?: Record<string, unknown> }[]) {
    const functionResponses = []
    for (const fc of calls) {
      const name = fc.name ?? ''
      let output: Record<string, unknown>
      try {
        output = await executeFunction(name, fc.args ?? {})
      } catch (err) {
        output = { error: err instanceof Error ? err.message : String(err) }
      }
      this.push('tool', `${name}${fc.args && Object.keys(fc.args).length ? ' ' + JSON.stringify(fc.args) : ''}`)
      functionResponses.push({ id: fc.id, name, response: { output } })
    }
    this.session?.sendToolResponse({ functionResponses })
  }

  async startMic() {
    if (!this.session || this.mic.active) return
    try {
      await this.mic.start((b64) => this.session?.sendRealtimeInput({ audio: { data: b64, mimeType: 'audio/pcm;rate=16000' } }))
      this.emit({ micOn: true })
    } catch (err) {
      this.emit({ error: 'Mikrofonga ruxsat berilmadi: ' + (err instanceof Error ? err.message : String(err)) })
    }
  }

  stopMic() {
    if (!this.mic.active) return
    this.mic.stop()
    this.session?.sendRealtimeInput({ audioStreamEnd: true })
    this.emit({ micOn: false })
  }

  get micLevel() {
    return this.mic.level
  }

  sendText(text: string) {
    if (!this.session) return
    this.finalize()
    this.push('user', text)
    this.player.flush()
    this.session.sendClientContent({ turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true })
  }

  disconnect() {
    this.stopMic()
    if (this.tick) window.clearInterval(this.tick)
    this.tick = null
    this.player.flush()
    this.session?.close()
    this.session = null
    this.emit({ status: 'closed', speaking: false })
  }
}
