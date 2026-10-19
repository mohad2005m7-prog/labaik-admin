// أرقام وتواريخ بنفس كتابة Figma:
//   الأعداد بالأرقام العربية (٣٬٧٠٥) — تواريخ الجدول بالأرقام اللاتينية (2026/01/12)

export const arNum = (n) => Number(n ?? 0).toLocaleString('ar-EG')

/** "2026-01-12" → "2026/01/12" */
export const slashDate = (d) => (d ? String(d).slice(0, 10).replaceAll('-', '/') : '—')

/** "الجمعة، ١٦ أكتوبر ٢٠٢٦" */
export function todayLine(date = new Date()) {
  return new Intl.DateTimeFormat('ar-EG-u-ca-gregory-nu-arab', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

const DAY = 86400000

export function dayDiff(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY)
}

function startOfDay(d) {
  const x = new Date(d)
  return Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate())
}

/** "2026-01-12" + سنة → "2027-01-12" */
export function plusYear(date) {
  const d = new Date(`${String(date).slice(0, 10)}T00:00:00Z`)
  d.setUTCFullYear(d.getUTCFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export const todayIso = () => new Date().toISOString().slice(0, 10)
