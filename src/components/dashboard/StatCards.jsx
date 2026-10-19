import { arNum } from '../../lib/format'

// -------------------------------------------------------------
// كروت الأرقام (Figma: 260×140، radius 16، padding 18/20، gap 15، ظل 3,4 blur 7.8 #113A32 18%)
// ⚠️ بـ Figma الصف عرضه 1109 وبيطلع برّا المساحة (آخر كرت مقصوص 33px) — هون نفس الصف بعرض الجدول (1029)
//    فكل كرت 240 والفراغ 23، ونهايته عند x1075 متل Figma
// -------------------------------------------------------------
export default function StatCards({ data }) {
  const cards = [
    ['الشركات المفعّلة', data?.activeCompanies, `من أصل ${arNum(data?.totalCompanies)} شركة`],
    ['المعتمرون النشطون', data?.activePilgrims, 'عبر جميع الشركات المفعّلة'],
    ['الاشتراكات السارية', data?.activeSubscriptions, `${arNum(data?.subscriptionsExpiringIn30Days)} تنتهي خلال ٣٠ يوماً`],
    ['طلبات معلّقة', data?.pendingRequests, 'تجديدات وطلبات خدمات'],
  ]
  return (
    <div className="absolute top-[151px] left-[46px] flex h-[140px] w-[1029px] gap-[23px]">
      {cards.map(([title, value, sub]) => (
        <div key={title} className="flex h-[140px] w-[240px] flex-col gap-[15px] rounded-[16px] bg-white px-[20px] py-[18px] text-right shadow-card">
          <span className="text-[20px] leading-[28px] font-semibold">{title}</span>
          <span className="flex flex-col">
            <span className="text-[32px] leading-[40px] font-bold">{data ? arNum(value) : '—'}</span>
            <span className="text-[13px] leading-[19px] text-muted">{data ? sub : ' '}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
