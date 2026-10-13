/* ============================================================
   Yordamchi ↔ taqdimot ko‘prigi.

   Deck navigatsiyani ro‘yxatdan o‘tkazadi (goTo, joriy slayd),
   interaktiv slaydlar esa o‘z buyruq-ishlovchisini (useSlideCommands).
   Yordamchi buyruq yuborganda: avval kerakli slaydga o‘tiladi, so‘ng
   buyruq slaydga yetkaziladi (slayd hali ochilmagan bo‘lsa — navbatda
   turadi va u o‘rnatilgan zahoti bajariladi).
   ============================================================ */
import { useEffect, useRef } from 'react'

export type CommandArgs = Record<string, unknown>
export type CommandResult = Record<string, unknown> | void
export type CommandHandler = (args: CommandArgs) => CommandResult

export interface DeckNav {
  goTo: (slideId: string) => boolean
  current: () => { id: string; title: string; section: string; index: number }
}

let nav: DeckNav | null = null
const handlers = new Map<string, CommandHandler>()
const pending = new Map<string, { args: CommandArgs; resolve: (r: CommandResult) => void }>()

export function registerNav(n: DeckNav | null) {
  nav = n
}

export function currentSlide() {
  return nav?.current() ?? null
}

export function goToSlide(slideId: string): boolean {
  return nav?.goTo(slideId) ?? false
}

/** Slayd o‘z buyruqlarini qabul qiladi (bitta ishlovchi, args ichida amal nomi) */
export function useSlideCommands(slideId: string, handler: CommandHandler) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    const h: CommandHandler = (args) => ref.current(args)
    handlers.set(slideId, h)
    const p = pending.get(slideId)
    if (p) {
      pending.delete(slideId)
      // slayd endigina o‘rnatildi — buyruqni keyingi kadrda beramiz
      window.setTimeout(() => p.resolve(h(p.args)), 30)
    }
    return () => {
      handlers.delete(slideId)
    }
  }, [slideId])
}

/** Slaydga o‘tib, unga buyruq yuborish; natija — ishlovchi qaytargan ob’ekt */
export function applyCommand(slideId: string, args: CommandArgs): Promise<CommandResult> {
  const navigated = goToSlide(slideId)
  const h = handlers.get(slideId)
  if (h && nav?.current().id === slideId) return Promise.resolve(h(args))
  if (!navigated) return Promise.resolve({ error: `Slayd topilmadi: ${slideId}` })
  return new Promise((resolve) => {
    pending.set(slideId, { args, resolve })
    window.setTimeout(() => {
      if (pending.get(slideId)?.resolve === resolve) {
        pending.delete(slideId)
        resolve({ ok: true, note: 'Slayd ochildi' })
      }
    }, 2000)
  })
}
