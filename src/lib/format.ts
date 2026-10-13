/** Minglik ajratgichli son: 15000 → «15 000» */
export function fmt(n: number, digits = 0): string {
  const [int, frac] = Math.abs(n).toFixed(digits).split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return (n < 0 ? '−' : '') + grouped + (frac ? ',' + frac : '')
}
