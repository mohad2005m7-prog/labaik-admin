import { todayLine } from '../../lib/format'
import { PlusIcon, SearchIcon } from '../Icons'

// -------------------------------------------------------------
// رأس الصفحة (Figma):
//   الترحيب 383×63 (693,49) — العنوان 26 Bold + سطر التاريخ 15
//   البحث + إضافة شركة 509×48 (46,68): الزر 182×48 #113A2E — فراغ 11 — البحث 316×48
// -------------------------------------------------------------
export default function TopBar({ query, onQuery, onAdd }) {
  return (
    <>
      <div className="absolute top-[49px] left-[693px] flex h-[63px] w-[383px] flex-col items-end justify-between text-right">
        <h1 className="m-0 text-[26px] leading-[34px] font-bold whitespace-nowrap">مرحباً بك في لوحة لبيك</h1>
        <p className="m-0 text-[15px] leading-[22px] whitespace-nowrap">{todayLine()}، نظرة عامة على الشركات والاشتراكات</p>
      </div>

      <div className="absolute top-[68px] left-[46px] flex h-[48px] w-[509px] flex-row-reverse items-stretch gap-[11px]" dir="ltr">
        <label className="flex w-[316px] items-center gap-[10px] rounded-[10px] border border-line bg-white pr-[14px] pl-[14px]" dir="rtl">
          <SearchIcon size={22} className="shrink-0 text-icon" />
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="ابحث عن الشركة" className="h-full w-full bg-transparent text-[16px] outline-none" />
        </label>
        <button type="button" onClick={onAdd} className="flex w-[182px] items-center justify-center gap-[8px] rounded-[10px] bg-brand text-[16px] font-semibold text-white" dir="rtl">
          <PlusIcon size={20} />
          <span>إضافة شركة</span>
        </button>
      </div>
    </>
  )
}
