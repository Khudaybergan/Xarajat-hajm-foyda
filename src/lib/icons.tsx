/* ============================================================
   Chiziqli ikonkalar (24×24, stroke). Tashqi kutubxonasiz —
   xarita tugunlari, kartochkalar va boshqaruv tugmalari uchun.
   ============================================================ */
import type { ReactNode } from 'react'

const PATHS: Record<string, ReactNode> = {
  /* --- xarita guruhlari --- */
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
    </>
  ),
  factory: (
    <>
      <path d="M3.5 20V10l5 3.2V10l5 3.2V5.5h4V20z" />
      <path d="M3 20h18M8 16.5h1.5M12.5 16.5H14" />
    </>
  ),
  office: (
    <>
      <path d="M5.5 20V4.5h9V20M14.5 9.5h4V20M3.5 20h17" />
      <path d="M8.5 8h3M8.5 11.5h3M8.5 15h3" />
    </>
  ),
  split: (
    <>
      <path d="M4 12h5.5l4-6H20M9.5 12l4 6H20" />
      <path d="M17.5 3.5 20 6l-2.5 2.5M17.5 15.5 20 18l-2.5 2.5" />
    </>
  ),
  trend: (
    <>
      <path d="M4 4v16h16" />
      <path d="M7.5 15.5 11 12l3 2.5 5-6.5" />
    </>
  ),
  bank: (
    <>
      <path d="M3.5 9.5 12 4.5l8.5 5M5 9.5h14M4 19.5h16" />
      <path d="M7 12.5v4.5M12 12.5v4.5M17 12.5v4.5" />
    </>
  ),
  percent: (
    <>
      <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z" />
      <path d="m9.5 13.5 5-5" />
      <circle cx="9.7" cy="8.7" r="0.9" />
      <circle cx="14.3" cy="13.3" r="0.9" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M7.5 20h9M5 7h14" />
      <path d="M5 7 2.8 13a2.4 2.4 0 0 0 4.4 0zM19 7l-2.2 6a2.4 2.4 0 0 0 4.4 0z" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="7" rx="6.5" ry="2.8" />
      <path d="M5.5 7v5c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8V7" />
      <path d="M5.5 12v5c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-5" />
    </>
  ),
  /* --- toifalar --- */
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c.4-3.3 2.6-5.2 5.5-5.2s5.1 1.9 5.5 5.2" />
      <path d="M15.2 5.6a3 3 0 0 1 0 5.8M17.2 14.6c1.8.7 3 2.3 3.3 4.9" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h10.5v10H3zM13.5 10h4l3.5 3.5v3h-7.5" />
      <circle cx="7.5" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="1.5" />
      <path d="M9 7.5V5h6v2.5M3.5 13h17" />
    </>
  ),
  bolt: <path d="M13 3 5.5 13.5H11L10 21l8-11h-5.5z" />,
  key: (
    <>
      <circle cx="8" cy="14.5" r="4" />
      <path d="m11 11.5 8.5-8M16 7l2.5 2.5M13.5 9.5l2 2" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M10.5 17.5h3" />
    </>
  ),
  basket: (
    <>
      <path d="M4 10h16l-1.6 9H5.6zM8 10l3-6M16 10l-3-6" />
      <path d="M9.5 13.5v2.5M14.5 13.5v2.5" />
    </>
  ),
  dots: (
    <>
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
    </>
  ),
  /* --- mazmun kartochkalari --- */
  box: (
    <>
      <path d="m12 3.5 8 4.2v8.6l-8 4.2-8-4.2V7.7z" />
      <path d="m4.3 7.9 7.7 4 7.7-4M12 12v8.3" />
    </>
  ),
  cart: (
    <>
      <path d="M3.5 5h2.6l2.2 10h9.4l1.8-7.2H7" />
      <circle cx="9.5" cy="18.6" r="1.3" />
      <circle cx="16.5" cy="18.6" r="1.3" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.3M12 18.2v2.3M3.5 12h2.3M18.2 12h2.3M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6" />
    </>
  ),
  tag: (
    <>
      <path d="M3.8 12.6V4.8h7.8l8.6 8.6-7.8 7.8z" />
      <circle cx="8" cy="9" r="1.2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="12" cy="12" r="0.8" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5 6v5.5c0 4.3 2.9 7.4 7 9 4.1-1.6 7-4.7 7-9V6z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  /* --- CVP --- */
  flag: (
    <>
      <path d="M6 21V4" />
      <path d="M6 4h11l-2.5 4 2.5 4H6" />
    </>
  ),
  layers: (
    <>
      <path d="m12 4 8 4.5-8 4.5-8-4.5z" />
      <path d="m4 12.5 8 4.5 8-4.5M4 16.5 12 21l8-4.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calc: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M8 7h8M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01" />
    </>
  ),
  up: <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />,
  down: <path d="M12 5v14M5.5 12.5 12 19l6.5-6.5" />,
  equal: <path d="M6 9.5h12M6 14.5h12" />,
  warn: (
    <>
      <path d="M12 4 2.8 19.5h18.4z" />
      <path d="M12 10v4.5M12 17.2h.01" />
    </>
  ),
  book: (
    <>
      <path d="M4.5 5.5A2 2 0 0 1 6.5 4H19v15H6.5a2 2 0 0 0-2 2z" />
      <path d="M4.5 19.5V5.5M8 8h7" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5.5h16v10H9l-4 3.5z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3.5" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6" />
    </>
  ),
  micOn: (
    <>
      <rect x="9" y="3.5" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6" />
    </>
  ),
  /* --- boshqaruv --- */
  left: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  right: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  tiles: (
    <>
      <rect x="4" y="5" width="16" height="3.4" rx="0.8" />
      <rect x="4" y="10.3" width="16" height="3.4" rx="0.8" />
      <rect x="4" y="15.6" width="16" height="3.4" rx="0.8" />
    </>
  ),
  expand: <path d="M4.5 9.5v-5h5M19.5 9.5v-5h-5M4.5 14.5v5h5M19.5 14.5v5h-5" />,
  compress: <path d="M9.5 4.5v5h-5M14.5 4.5v5h5M9.5 19.5v-5h-5M14.5 19.5v-5h5" />,
  minus: <path d="M6 12h12" />,
  plus: <path d="M6 12h12M12 6v12" />,
}

interface Props {
  id: string
  size?: number
  className?: string
}

export function Icon({ id, size = 24, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[id] ?? PATHS.grid}
    </svg>
  )
}
