/* Slaydlar reyestri: tartib, sarlavha va bo‘lim (mundarija va yuqori satr uchun).
   Asosiy oqim «5-mavzu. “Xarajat–hajm–foyda” tahlili va zararsizlik nuqtasi»
   taqdimotining tartibini takrorlaydi; «Qo‘shimcha» — savol-javob uchun zaxira. */
import type { ComponentType } from 'react'
import type { SlideProps } from './Frame'
import { Assumptions, Chain, Cover, Questions } from './Intro'
import { HighLow } from './CostBehavior'
import { MapSlide } from './MapSlide'
import { Margin } from './Margin'
import { Breakeven } from './Breakeven'
import { Target } from './Target'
import { Risk } from './Risk'
import { Package, Resource } from './Mix'
import { Advertising, Effects } from './Decisions'
import { Limits, Scenarios } from './Scenarios'
import { CaseIntro, CaseResults, CaseSolution } from './Case'
import { Advice, Discussion, Literature, Summary, Thanks } from './Closing'

export interface SlideDef {
  id: string
  title: string
  section: string
  Component: ComponentType<SlideProps>
}

export const SLIDES: SlideDef[] = [
  { id: 'cover', title: '«Xarajat–hajm–foyda» tahlili va zararsizlik nuqtasi', section: 'Kirish', Component: Cover },
  { id: 'chain', title: 'CVP foydani boshqarish zanjirini ochadi', section: 'Kirish', Component: Chain },
  { id: 'questions', title: 'CVP qaysi boshqaruv savollariga javob beradi', section: 'Kirish', Component: Questions },
  { id: 'assumptions', title: 'CVP natijasi farazlar ichida ishonchli', section: 'Kirish', Component: Assumptions },
  { id: 'highlow', title: 'Aralash xarajatni ajratish: yuqori-past usuli', section: 'Xarajat xulqi', Component: HighLow },
  { id: 'map', title: 'CVP ko‘rsatkichlar xaritasi', section: 'Model', Component: MapSlide },
  { id: 'margin', title: 'Marjinal daromad — foydaning tayanch o‘lchovi', section: 'Marjinal daromad', Component: Margin },
  { id: 'breakeven', title: 'Zararsizlik nuqtasi: zarar va foyda zonalari', section: 'Zararsizlik', Component: Breakeven },
  { id: 'target', title: 'Maqsadli foyda sotuv hajmini belgilaydi', section: 'Zararsizlik', Component: Target },
  { id: 'risk', title: 'Xavfsizlik marjasi va operatsion leveraj', section: 'Risk', Component: Risk },
  { id: 'package', title: 'Ko‘p mahsulotli CVP: paket usuli', section: 'Ko‘p mahsulot', Component: Package },
  { id: 'resource', title: 'Cheklangan resursda resursga MD hal qiladi', section: 'Ko‘p mahsulot', Component: Resource },
  { id: 'effects', title: 'Parametr o‘zgarishining zararsizlikka ta’siri', section: 'Qarorlar', Component: Effects },
  { id: 'advertising', title: 'Reklama qarori qo‘shimcha MD bilan baholanadi', section: 'Qarorlar', Component: Advertising },
  { id: 'scenarios', title: 'Ssenariylar foyda diapazonini ko‘rsatadi', section: 'Risk', Component: Scenarios },
  { id: 'limits', title: 'CVP cheklovlari va modelning o‘rni', section: 'Risk', Component: Limits },
  { id: 'case', title: 'Keys: «Navro‘z Texno» MCHJ', section: 'Keys', Component: CaseIntro },
  { id: 'case-solution', title: 'Keys yechimi: interaktiv hisob', section: 'Keys', Component: CaseSolution },
  { id: 'case-results', title: 'Keysning yakuniy natijalari', section: 'Keys', Component: CaseResults },
  { id: 'summary', title: 'Mavzu bo‘yicha xulosa', section: 'Yakun', Component: Summary },
  { id: 'advice', title: 'Umumiy tavsiyalar', section: 'Yakun', Component: Advice },
  { id: 'thanks', title: 'E’tiboringiz uchun rahmat', section: 'Yakun', Component: Thanks },
  /* ---------- zaxira slaydlar: asosiy oqimga kirmaydi, faqat mundarijadan ochiladi ---------- */
  { id: 'x-discussion', title: 'Guruhlar uchun interfaol muhokama', section: 'Qo‘shimcha', Component: Discussion },
  { id: 'x-literature', title: 'Foydalanilgan adabiyotlar', section: 'Qo‘shimcha', Component: Literature },
]

/** Asosiy oqimdagi slaydlar soni («Rahmat» bilan tugaydi) */
export const MAIN_COUNT = SLIDES.findIndex((sl) => sl.section === 'Qo‘shimcha')
