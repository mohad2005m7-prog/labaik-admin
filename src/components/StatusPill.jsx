import { CompanyStatus } from '../api/admin'

// شارة الحالة (93×32): مفعّل أخضر — متوقّف أصفر — منتهي أحمر
const STYLES = {
  [CompanyStatus.Active]: ['مفعّل', 'bg-okBg text-okText'],
  [CompanyStatus.Stopped]: ['متوقّف', 'bg-warnBg text-gold'],
  [CompanyStatus.Expired]: ['منتهي', 'bg-badBg text-dangerText'],
}

export default function StatusPill({ status, className = 'h-[32px] w-[93px] text-[16px]' }) {
  const [label, colors] = STYLES[status] ?? STYLES[CompanyStatus.Active]
  return <span className={`inline-flex items-center justify-center gap-[4px] rounded-full ${colors} ${className}`}>• {label}</span>
}
