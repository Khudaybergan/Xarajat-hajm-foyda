/* ============================================================
   CVP xaritasi (drill-down daraxti).
   Manba: «5-mavzu. “Xarajat–hajm–foyda” tahlili va zararsizlik
   nuqtasi» taqdimoti. Asosiy misol: narx 100 000, birlik o‘zgaruvchan
   xarajat 60 000, doimiy xarajat 160 mln so‘m, sotuv 6 000 dona.
   ============================================================ */

export type PanelBlock =
  | { kind: 'text'; body: string }
  | { kind: 'list'; title: string; items: string[] }
  | { kind: 'example'; body: string }
  | { kind: 'formula'; body: string; note?: string }

export interface CostNode {
  id: string
  /** To‘liq nom */
  name: string
  /** Xaritadagi qisqa yozuv (bo‘lmasa — name) */
  label?: string
  /** Ikonka kaliti (lib/icons) */
  icon?: string
  /** Hover-kartochka va panel uchun 1–2 gap */
  desc: string
  /** Ildiz markazidagi mono-satr */
  coreMeta?: string
  /** Tayyor panel bloklari */
  panel?: PanelBlock[]
  children?: CostNode[]
}

/* ---------- 1-rejim: CVP ko‘rsatkichlari ---------- */
export const CVP_ROOT: CostNode = {
  id: 'root',
  name: 'CVP tahlili',
  icon: 'target',
  coreMeta: 'Xarajat · hajm · foyda',
  desc: 'CVP tahlili narx, sotuv hajmi, o‘zgaruvchan va doimiy xarajatlar hamda mahsulot tarkibining operatsion foydaga ta’sirini bitta modelda bog‘laydi.',
  panel: [
    { kind: 'formula', body: 'Foyda = (P − v) × Q − F', note: 'P — narx, v — birlik o‘zgaruvchan xarajat, Q — hajm, F — doimiy xarajat' },
    {
      kind: 'list',
      title: 'Qaysi savollarga javob beradi',
      items: ['Qancha sotish kerak?', 'Narx pasaysa nima bo‘ladi?', 'Reklama foydalimi?', 'Talab pasayishiga chidamlilik?', 'Qaysi mahsulot ustuvor?'],
    },
  ],
  children: [
    {
      id: 'md',
      name: 'Marjinal daromad',
      label: 'Marjinal daromad',
      icon: 'trend',
      desc: 'Narx bilan birlik o‘zgaruvchan xarajat o‘rtasidagi farq — doimiy xarajatni qoplab, foyda shakllantiradigan qism.',
      panel: [
        { kind: 'formula', body: 'Birlik MD = P − v', note: '100 000 − 60 000 = 40 000 so‘m' },
        { kind: 'formula', body: 'MD koeffitsienti = Birlik MD ÷ P', note: '40 000 ÷ 100 000 = 40 %' },
        { kind: 'formula', body: 'Foyda = Jami MD − F', note: '240 mln − 160 mln = 80 mln so‘m' },
        { kind: 'example', body: 'Har 100 so‘mlik tushumdan 40 so‘m marjinal daromad qoladi.' },
      ],
    },
    {
      id: 'bep',
      name: 'Zararsizlik nuqtasi',
      label: 'Zararsizlik',
      icon: 'scale',
      desc: 'Foyda nolga teng bo‘ladigan sotuv hajmi: jami marjinal daromad doimiy xarajatga tenglashadi.',
      panel: [
        { kind: 'formula', body: 'Q₀ = F ÷ Birlik MD', note: '160 mln ÷ 40 000 = 4 000 dona' },
        { kind: 'formula', body: 'S₀ = F ÷ MD koeffitsienti', note: '160 mln ÷ 40 % = 400 mln so‘m' },
        { kind: 'text', body: '4 000 donadan chapda — zarar zonasi, o‘ngda — foyda zonasi.' },
      ],
    },
    {
      id: 'target',
      name: 'Maqsadli foyda',
      label: 'Maqsadli foyda',
      icon: 'flag',
      desc: 'Belgilangan operatsion yoki sof foydaga erishish uchun zarur sotuv hajmi.',
      panel: [
        { kind: 'formula', body: 'Q = (F + Maqsadli foyda) ÷ Birlik MD', note: '(160 + 120) mln ÷ 40 000 = 7 000 dona' },
        { kind: 'formula', body: 'Soliqdan oldingi foyda = Sof foyda ÷ (1 − t)', note: '96 mln ÷ 0,8 = 120 mln so‘m' },
        { kind: 'example', body: 'Sof foyda avval soliqdan oldingi foydaga aylantiriladi, so‘ng hajm hisoblanadi.' },
      ],
    },
    {
      id: 'mos',
      name: 'Xavfsizlik marjasi',
      label: 'Xavfsizlik marjasi',
      icon: 'shield',
      desc: 'Rejalashtirilgan sotuvning zararsizlik nuqtasidan qanchalik uzoqligi — talab pasayishiga chidamlilik zaxirasi.',
      panel: [
        { kind: 'formula', body: 'XM = Reja sotuv − Zararsizlik sotuv', note: '6 000 − 4 000 = 2 000 dona' },
        { kind: 'formula', body: 'XM % = XM ÷ Reja sotuv', note: '2 000 ÷ 6 000 = 33,3 %' },
        { kind: 'text', body: 'Sotuv 33,3 % gacha pasaymaguncha korxona zarar zonasiga kirmaydi.' },
      ],
    },
    {
      id: 'dol',
      name: 'Operatsion leveraj',
      label: 'Operatsion leveraj',
      icon: 'bolt',
      desc: 'Foydaning sotuv hajmi o‘zgarishiga sezgirligi: doimiy xarajat ulushi qancha katta bo‘lsa, leveraj shuncha yuqori.',
      panel: [
        { kind: 'formula', body: 'DOL = Jami MD ÷ Operatsion foyda', note: '240 mln ÷ 80 mln = 3' },
        { kind: 'formula', body: 'ΔFoyda % ≈ DOL × ΔSotuv %', note: 'Sotuv ±10 % → foyda taxminan ±30 %' },
        { kind: 'example', body: 'Sotuv +10 %: foyda 80 → ≈104 mln. Sotuv −10 %: foyda 80 → ≈56 mln.' },
      ],
    },
    {
      id: 'mix',
      name: 'Ko‘p mahsulotli CVP',
      label: 'Sotuv tarkibi',
      icon: 'layers',
      desc: 'Bir nechta mahsulotda zararsizlik shartli «paket» orqali hisoblanadi; sotuv tarkibi o‘zgarsa natija ham siljiydi.',
      panel: [
        { kind: 'formula', body: 'Paket MD = Σ (ulush × birlik MD)', note: 'A:B = 2:3 → 2 × 50 + 3 × 30 = 190 ming so‘m' },
        { kind: 'formula', body: 'Zararsizlik paketi = F ÷ Paket MD', note: '380 mln ÷ 190 ming = 2 000 paket' },
        { kind: 'list', title: 'Natija', items: ['A mahsulot — 4 000 dona', 'B mahsulot — 6 000 dona'] },
      ],
    },
    {
      id: 'resource',
      name: 'Cheklangan resurs',
      label: 'Cheklangan resurs',
      icon: 'clock',
      desc: 'Resurs (mashina-soat, xomashyo) cheklangan bo‘lsa, birlik MD emas, resurs birligiga MD hal qiladi.',
      panel: [
        { kind: 'formula', body: 'Resursga MD = Birlik MD ÷ Resurs sarfi', note: 'B: 36 ming ÷ 3 soat = 12 ming so‘m/soat' },
        { kind: 'list', title: 'Ustuvorlik', items: ['1. B — 12 ming/soat', '2. A — 10 ming/soat', '3. C — 7 ming/soat'] },
      ],
    },
    {
      id: 'risk',
      name: 'Sezgirlik va ssenariy',
      label: 'Ssenariy va risk',
      icon: 'split',
      desc: 'Bitta parametr o‘zgarsa — sezgirlik; bir nechta bog‘liq taxmin birga o‘zgarsa — ssenariy tahlili.',
      panel: [
        { kind: 'list', title: 'Ssenariylar (6 000 donada)', items: ['Eng yaxshi — 143 mln', 'Asosiy — 80 mln', 'Eng yomon — 0 mln'] },
        { kind: 'formula', body: 'Kutilayotgan foyda = Σ (ehtimollik × foyda)', note: '0,25 × 143 + 0,5 × 80 + 0,25 × 0 = 75,75 mln' },
      ],
    },
  ],
}

/* ---------- 2-rejim: parametr o‘zgarishining ta’siri ---------- */
const effect = (id: string, name: string, label: string, icon: string, md: string, bep: string, why: string): CostNode => ({
  id,
  name,
  label,
  icon,
  desc: `${md} · ${bep}.`,
  panel: [
    { kind: 'list', title: 'Ta’siri', items: [`Marjinal daromad: ${md.toLowerCase()}`, `Zararsizlik: ${bep.toLowerCase()}`] },
    { kind: 'text', body: why },
  ],
})

export const TASIR_ROOT: CostNode = {
  id: 'tasir',
  name: 'Parametr o‘zgarishi',
  label: 'Parametr',
  icon: 'gear',
  coreMeta: 'Zararsizlikka ta’siri',
  desc: 'Narx, xarajat, hajm va sotuv tarkibi o‘zgarganda marjinal daromad va zararsizlik nuqtasi turlicha javob beradi.',
  panel: [{ kind: 'text', body: 'Qaror qabul qilishdan oldin har bir parametr o‘zgarishini zararsizlik va foydaga ta’siri bo‘yicha tekshiring.' }],
  children: [
    effect('p-price', 'Narx oshadi', 'Narx ↑', 'tag', 'MD oshadi', 'Zararsizlik kamayadi', 'Birlik MD kattalashadi, doimiy xarajatni qoplash uchun kamroq dona kerak bo‘ladi.'),
    effect('p-var', 'O‘zgaruvchan xarajat oshadi', 'O‘zgaruvchan ↑', 'box', 'MD kamayadi', 'Zararsizlik oshadi', 'Har bir dona kamroq MD beradi — doimiy xarajatni qoplash uchun ko‘proq sotish kerak.'),
    effect('p-fixed', 'Doimiy xarajat oshadi', 'Doimiy ↑', 'bank', 'MD o‘zgarmaydi', 'Zararsizlik oshadi', 'Qoplanishi kerak bo‘lgan summa kattalashadi, birlik MD esa o‘zgarmaydi.'),
    effect('p-vol', 'Hajm oshadi', 'Hajm ↑', 'cart', 'Nuqta o‘zgarmaydi', 'Foyda oshadi', 'Zararsizlik nuqtasi hajmga bog‘liq emas; har qo‘shimcha dona birlik MD miqdorida foyda qo‘shadi.'),
    effect('p-mix', 'Yuqori MDli mahsulot ulushi oshadi', 'Tarkib ↑', 'layers', 'O‘rtacha MD oshadi', 'Zararsizlik kamayadi', 'Paketdagi o‘rtacha tortilgan MD kattalashadi — zararsizlik paketi kamayadi.'),
  ],
}
