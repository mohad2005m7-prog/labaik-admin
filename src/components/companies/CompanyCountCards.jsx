import { CompanyStatus } from '../../api/admin'
import { arNum } from '../../lib/format'
import { BanIcon, CheckCircleIcon, DoubleCheckIcon, RingIcon } from '../Icons'

// -------------------------------------------------------------
// كروت صفحة «الشركات» (Figma «الداشبورد» — صفحة إدارة الشركات):
//   إجمالي الشركات · المفعّلة · المتوقّفة · المنتهية — العنوان 20 SemiBold يمين والأيقونة 24 يسار، الرقم 32 Bold تحته
//   نفس مقاس كروت لوحة التحكم (240×140، فراغ 23، من x46 لـ x1075) — بـ Figma الصف أعرض وآخر كرت مقصوص
//   الأرقام محسوبة من قائمة الشركات نفسها (بتتحدّث مع أي إيقاف / تفعيل / إضافة)
// -------------------------------------------------------------
export default function CompanyCountCards({ companies, loaded }) {
  const count = (status) => companies.filter((c) => c.status === status).length
  const cards = [
    ['إجمالي الشركات', companies.length, <DoubleCheckIcon key="i" size={24} className="text-grey3" />],
    ['الشركات المفعلة', count(CompanyStatus.Active), <CheckCircleIcon key="i" size={24} className="text-[#22A84A]" />],
    ['الشركات المتوقفة', count(CompanyStatus.Stopped), <BanIcon key="i" size={24} className="text-danger" />],
    ['الشركات المنتهية', count(CompanyStatus.Expired), <RingIcon key="i" size={24} className="text-[#F5A623]" />],
  ]
  return (
    <div className="absolute top-[151px] left-[46px] flex h-[140px] w-[1029px] gap-[23px]">
      {cards.map(([title, value, icon]) => (
        <div key={title} className="flex h-[140px] w-[240px] flex-col gap-[22px] rounded-[16px] bg-white px-[20px] py-[18px] text-right shadow-card">
          <span className="flex items-center justify-between">
            <span className="text-[20px] leading-[28px] font-semibold">{title}</span>
            {icon}
          </span>
          <span className="text-[32px] leading-[40px] font-bold">{loaded ? arNum(value) : '—'}</span>
        </div>
      ))}
    </div>
  )
}
