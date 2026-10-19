import { CompanyStatus } from '../../api/admin'
import { arNum, dayDiff, slashDate } from '../../lib/format'
import { EyeIcon } from '../Icons'
import StatusPill from '../StatusPill'
import Toggle from '../Toggle'

// -------------------------------------------------------------
// صف شركة (Figma: 81 طول، أعمدة: الشركة 302 · التاريخ 212 · الحالة 93 · الإجراءات 118 — فراغ 89)
//   الشعار دائرة 70 — الاسم 20 — «١٬٢٤٠ معتمر نشط» 12 #717171
//   التاريخ: البداية يمين والنهاية يسار (14) — شريط 4 (المنقضي من المدة) — «متبقي ٨٨ يوم» 12
//     ≤ ٣٠ يوم: ذهبي #B5A72A — منتهي: أحمر كامل #F44336 «انتهى منذ ١٣٧ يوم»
//   الإجراءات: عرض 58×52 + مفتاح الإيقاف 48×24 (منتهي = معطّل)
// -------------------------------------------------------------
export default function CompanyRow({ company, onOpen, onToggle, busy }) {
  const { status, subscriptionStartUtc: start, subscriptionEndUtc: end } = company
  const expired = status === CompanyStatus.Expired
  const remaining = company.daysRemaining ?? (end ? Math.max(0, dayDiff(new Date(), end)) : null)
  const soon = !expired && remaining != null && remaining <= 30

  let progress = 0
  if (expired) progress = 1
  else if (start && end) {
    const total = dayDiff(start, end)
    progress = total > 0 ? Math.min(1, Math.max(0, dayDiff(start, new Date()) / total)) : 0
  }

  const barColor = expired ? 'bg-danger' : soon ? 'bg-gold' : 'bg-brand'
  const labelColor = expired ? 'text-danger' : soon ? 'text-gold' : 'text-ink'
  const label = expired
    ? `انتهى منذ ${arNum(end ? Math.max(0, dayDiff(end, new Date())) : 0)} يوم`
    : remaining == null
      ? 'بدون تاريخ انتهاء'
      : `متبقي ${arNum(remaining)} يوم`

  return (
    <div className="flex h-[81px] items-center gap-[89px]">
      {/* الشركة */}
      <div className="flex w-[302px] items-center gap-[7px]">
        <Logo company={company} />
        <div className="flex min-w-0 flex-col text-right">
          <span className="truncate text-[20px] leading-[30px]">{company.name}</span>
          <span className="text-[12px] leading-[18px] text-muted">{arNum(company.activePilgrims)} معتمر نشط</span>
        </div>
      </div>

      {/* تاريخ الاشتراك ونهايته */}
      <div className="flex w-[212px] flex-col">
        <div className="flex justify-between text-[14px] leading-[20px]">
          <span>{slashDate(start)}</span>
          <span>{slashDate(end)}</span>
        </div>
        <div className="mt-[9px] ml-[6px] h-[4px] rounded-full bg-track" dir="rtl">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress * 100}%` }} />
        </div>
        <span className={`mt-[6px] text-[12px] leading-[18px] ${labelColor}`}>{label}</span>
      </div>

      {/* الحالة */}
      <div className="w-[93px]">
        <StatusPill status={status} />
      </div>

      {/* الإجراءات */}
      <div className="flex w-[118px] items-center gap-[10px]">
        <Toggle
          on={status === CompanyStatus.Active}
          disabled={expired || busy}
          label={status === CompanyStatus.Active ? 'إيقاف الشركة' : 'تفعيل الشركة'}
          onChange={(on) => onToggle(company, on)}
        />
        <button
          type="button"
          onClick={() => onOpen(company)}
          aria-label="عرض الشركة"
          className="flex h-[52px] w-[58px] items-center justify-center rounded-[12px] border border-soft bg-white text-icon shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
        >
          <EyeIcon size={26} />
        </button>
      </div>
    </div>
  )
}

export function Logo({ company, size = 70 }) {
  const style = { width: size, height: size }
  if (company?.logoUrl) {
    return <img src={company.logoUrl} alt="" style={style} className="shrink-0 rounded-full bg-white object-cover shadow-[0_1px_4px_rgba(0,0,0,0.12)]" />
  }
  return (
    <span style={{ ...style, fontSize: size * 0.4 }} className="flex shrink-0 items-center justify-center rounded-full bg-soft font-bold text-brand">
      {(company?.name || '؟').trim().charAt(0)}
    </span>
  )
}
