/* ============================================================
   Audio: mikrofon → PCM16 16 kHz (base64) va 24 kHz PCM ijro.
   AudioWorklet kodi satr sifatida (Blob URL) — yagona faylli
   build uchun alohida fayl kerak emas.
   ============================================================ */

const WORKLET = `
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;
    this.pos = 0;
    this.buf = [];
    this.count = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    // chiziqli interpolyatsiya bilan 16 kHz ga tushirish
    const out = [];
    while (this.pos < ch.length - 1) {
      const i = Math.floor(this.pos);
      const f = this.pos - i;
      out.push(ch[i] * (1 - f) + ch[i + 1] * f);
      this.pos += this.ratio;
    }
    this.pos -= ch.length;
    if (this.pos < 0) this.pos = 0;
    for (const v of out) this.buf.push(v);
    if (this.buf.length >= 1600) { // ~100 ms
      const pcm = new Int16Array(this.buf.length);
      for (let k = 0; k < this.buf.length; k++) {
        const s = Math.max(-1, Math.min(1, this.buf[k]));
        pcm[k] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
      this.buf = [];
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCapture);
`

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

function fromBase64(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

/** Mikrofon: 100 ms lik PCM16 bo‘laklarini base64 ko‘rinishda beradi */
export class MicCapture {
  private ctx: AudioContext | null = null
  private stream: MediaStream | null = null
  private node: AudioWorkletNode | null = null
  /** Ovoz darajasi 0..1 (indikator uchun) */
  level = 0

  async start(onChunk: (b64: string) => void) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
    })
    this.ctx = new AudioContext()
    const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }))
    await this.ctx.audioWorklet.addModule(url)
    URL.revokeObjectURL(url)
    const src = this.ctx.createMediaStreamSource(this.stream)
    this.node = new AudioWorkletNode(this.ctx, 'pcm-capture')
    this.node.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
      const pcm = new Int16Array(e.data)
      let sum = 0
      for (let i = 0; i < pcm.length; i += 8) sum += Math.abs(pcm[i])
      this.level = Math.min(1, (sum / (pcm.length / 8)) / 6000)
      onChunk(toBase64(e.data))
    }
    src.connect(this.node)
    // chiqishga ulamaymiz — o‘z ovozini eshitmaslik uchun
    if (this.ctx.state === 'suspended') await this.ctx.resume()
  }

  stop() {
    this.node?.disconnect()
    this.stream?.getTracks().forEach((t) => t.stop())
    void this.ctx?.close()
    this.node = null
    this.stream = null
    this.ctx = null
    this.level = 0
  }

  get active() {
    return this.ctx !== null
  }
}

/** 24 kHz PCM16 bo‘laklarini uzluksiz ijro etadi */
export class PcmPlayer {
  private ctx: AudioContext | null = null
  private nextAt = 0
  private sources = new Set<AudioBufferSourceNode>()

  private ensure() {
    if (!this.ctx) this.ctx = new AudioContext({ sampleRate: 24000 })
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  enqueue(b64: string) {
    const ctx = this.ensure()
    const raw = fromBase64(b64)
    const n = Math.floor(raw.byteLength / 2)
    const view = new DataView(raw)
    const buf = ctx.createBuffer(1, n, 24000)
    const data = buf.getChannelData(0)
    for (let i = 0; i < n; i++) data[i] = view.getInt16(i * 2, true) / 0x8000
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    const at = Math.max(ctx.currentTime + 0.02, this.nextAt)
    src.start(at)
    this.nextAt = at + buf.duration
    this.sources.add(src)
    src.onended = () => this.sources.delete(src)
  }

  /** Model so‘zi bo‘linganda navbatni tozalash */
  flush() {
    for (const s of this.sources) {
      try {
        s.stop()
      } catch {
        /* allaqachon to‘xtagan */
      }
    }
    this.sources.clear()
    this.nextAt = 0
  }

  get speaking() {
    return this.ctx !== null && this.nextAt > this.ctx.currentTime + 0.05
  }

  close() {
    this.flush()
    void this.ctx?.close()
    this.ctx = null
  }
}
