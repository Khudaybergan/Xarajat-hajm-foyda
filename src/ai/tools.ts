/* ============================================================
   Yordamchi funksiyalari: Gemini chaqiradi → slayd ochiladi va
   parametrlar o‘rnatiladi. Har bir funksiya ishlovchidan qaytgan
   hisob natijasini modelga qaytaradi.
   ============================================================ */
import { Type, type FunctionDeclaration } from '@google/genai'
import { SLIDES } from '../slides'
import { applyCommand, currentSlide, goToSlide, type CommandArgs } from './bridge'

const num = (d: string) => ({ type: Type.NUMBER, description: d })
const str = (d: string, e?: string[]) => ({ type: Type.STRING, description: d, ...(e ? { enum: e, format: 'enum' } : {}) })

export const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'go_to_slide',
    description: 'Taqdimotning ko‘rsatilgan slaydiga o‘tadi. Umumiy savollar va navigatsiya uchun.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        slide_id: str('Slayd identifikatori yoki "next" / "prev"', [...SLIDES.map((s) => s.id), 'next', 'prev']),
      },
      required: ['slide_id'],
    },
  },
  {
    name: 'get_current_slide',
    description: 'Hozir ekranda qaysi slayd ochiq ekanini qaytaradi.',
  },
  {
    name: 'show_cost_behavior',
    description: 'Yuqori-past usuli slaydini ochib, jami xarajat grafigida hajmni o‘rnatadi (Y = 120 mln + 50 000 × X).',
    parameters: { type: Type.OBJECT, properties: { volume: num('Faoliyat hajmi, dona (0–10000)') } },
  },
  {
    name: 'show_breakeven',
    description: 'Zararsizlik grafigini ochadi; hajmni o‘rnatadi va tushum, jami xarajat, foydani qaytaradi. Asosiy misol: P 100 000, v 60 000, F 160 mln.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        volume: num('Sotuv hajmi, dona (0–8000)'),
        view: str('Grafik turi', ['cvp', 'pv']),
      },
    },
  },
  {
    name: 'show_margin',
    description: 'Marjinal daromad kalkulyatorini ochadi; kiritilgan qiymatlarni o‘rnatib MD, koeffitsient, jami MD va foydani qaytaradi.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        price: num('Sotuv narxi, so‘m/dona'),
        variable_cost: num('Birlik o‘zgaruvchan xarajat, so‘m/dona'),
        volume: num('Sotuv hajmi, dona'),
        fixed_cost_mln: num('Doimiy xarajat, mln so‘m'),
      },
    },
  },
  {
    name: 'show_target_profit',
    description: 'Maqsadli foyda kalkulyatorini ochadi va zarur sotuv hajmini qaytaradi.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        mode: str('op — operatsion foyda, net — sof foyda', ['op', 'net']),
        target_mln: num('Maqsadli foyda, mln so‘m (0–300)'),
        tax_percent: num('Foyda solig‘i stavkasi, % (faqat net uchun)'),
      },
    },
  },
  {
    name: 'show_leverage',
    description: 'Xavfsizlik marjasi va operatsion leveraj slaydini ochadi; sotuv o‘zgarishini (%) o‘rnatib yangi foydani qaytaradi.',
    parameters: { type: Type.OBJECT, properties: { sales_change_percent: num('Sotuv hajmi o‘zgarishi, % (−30…30)') } },
  },
  {
    name: 'show_product_mix',
    description: 'Ko‘p mahsulotli paket usuli slaydini ochadi; A va B ulushini o‘rnatib paket MD va zararsizlik paketini qaytaradi.',
    parameters: { type: Type.OBJECT, properties: { a_units: num('Paketdagi A dona (0–9)'), b_units: num('Paketdagi B dona (0–9)') } },
  },
  {
    name: 'show_resource',
    description: 'Cheklangan resurs slaydini ochadi va mahsulotni ajratib ko‘rsatadi.',
    parameters: { type: Type.OBJECT, properties: { product: str('Mahsulot', ['A', 'B', 'C']) } },
  },
  {
    name: 'show_advertising',
    description: 'Reklama qarori kalkulyatorini ochadi; qo‘shimcha doimiy xarajat va sotuv o‘sishini o‘rnatib foyda o‘zgarishini qaytaradi.',
    parameters: {
      type: Type.OBJECT,
      properties: { extra_fixed_mln: num('Qo‘shimcha doimiy xarajat, mln (0–80)'), extra_units: num('Sotuv o‘sishi, dona (0–2000)') },
    },
  },
  {
    name: 'show_scenarios',
    description: 'Ssenariylar slaydini ochadi; ehtimolliklarni (%) o‘rnatib kutilayotgan foydani qaytaradi.',
    parameters: {
      type: Type.OBJECT,
      properties: { best_percent: num('Eng yaxshi ssenariy ehtimolligi'), base_percent: num('Asosiy'), worst_percent: num('Eng yomon') },
    },
  },
  {
    name: 'show_case',
    description:
      'Keys («Navro‘z Texno») yechimini ochadi: topshiriqni tanlaydi, ixtiyoriy ravishda shartlarni o‘zgartiradi va javobni qaytaradi.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        task: str('md — MD; bep — zararsizlik; target — maqsadli foyda; safety — xavfsizlik marjasi; dol — leveraj; ad — reklama; price — narx −5 %', [
          'md',
          'bep',
          'target',
          'safety',
          'dol',
          'ad',
          'price',
        ]),
        price: num('Narx, so‘m'),
        variable_cost: num('Birlik o‘zgaruvchan xarajat, so‘m'),
        fixed_cost_mln: num('Doimiy xarajat, mln'),
        plan_units: num('Reja, dona'),
      },
      required: ['task'],
    },
  },
  {
    name: 'show_map',
    description: 'CVP xaritasini ochadi va tugun panelini ko‘rsatadi.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        mode: str('cvp — ko‘rsatkichlar; tasir — parametr ta’siri', ['cvp', 'tasir']),
        node: str('Tugun: md, bep, target, mos, dol, mix, resource, risk yoki p-price, p-var, p-fixed, p-vol, p-mix'),
      },
    },
  },
]

const SLIDE_OF: Record<string, string> = {
  show_cost_behavior: 'highlow',
  show_breakeven: 'breakeven',
  show_margin: 'margin',
  show_target_profit: 'target',
  show_leverage: 'risk',
  show_product_mix: 'package',
  show_resource: 'resource',
  show_advertising: 'advertising',
  show_scenarios: 'scenarios',
  show_case: 'case-solution',
  show_map: 'map',
}

export async function executeFunction(name: string, args: CommandArgs): Promise<Record<string, unknown>> {
  if (name === 'get_current_slide') {
    const c = currentSlide()
    return c ? { slide_id: c.id, title: c.title, section: c.section, number: c.index + 1 } : { error: 'Noma’lum' }
  }
  if (name === 'go_to_slide') {
    const cur = currentSlide()
    let id = String(args.slide_id ?? '')
    if ((id === 'next' || id === 'prev') && cur) {
      const main = SLIDES.filter((s) => s.section !== 'Qo‘shimcha')
      const i = Math.max(0, Math.min(main.length - 1, cur.index + (id === 'next' ? 1 : -1)))
      id = main[i].id
    }
    const ok = goToSlide(id)
    const s = SLIDES.find((x) => x.id === id)
    return ok && s ? { ok: true, slide_id: id, title: s.title } : { error: `Slayd topilmadi: ${id}` }
  }
  const slideId = SLIDE_OF[name]
  if (!slideId) return { error: `Noma’lum funksiya: ${name}` }
  const res = await applyCommand(slideId, args)
  return { ok: true, slide_id: slideId, ...(res ?? {}) }
}
