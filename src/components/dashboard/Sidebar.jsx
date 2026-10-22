import { BuildingIcon, CardIcon, GearIcon, GridIcon, ListIcon } from '../Icons'

// -------------------------------------------------------------
// السايدبار (Figma: 338×1024 عند x1102، #113A2E):
//   الشعار 69.36×91 (220,32) + «لبيــك» (115,10 100×103) + «لوحة تحكم المالك» (98,109 119×19)
//   القائمة 286×374 (34,165): 5 عناصر 62 طول وفراغ 16 — المختار أبيض والنص #113A2E
//   كرت المالك 304×89 (17,891): أفاتار 54 #B7964F + الاسم والصلاحية — الضغط عليه = تسجيل خروج (بتأكيد)
// العناصر اللي لسا ما إلها صفحة (soon) باهتة ومعطّلة وعليها «قريباً»
// -------------------------------------------------------------
const NAV = [
  ['dashboard', 'لوحة التحكم', GridIcon],
  ['companies', 'الشركات', BuildingIcon, true],
  ['subscriptions', 'الاشتراكات', CardIcon, true],
  ['log', 'سجل النظام', ListIcon, true],
  ['settings', 'الإعدادات', GearIcon, true],
]

export default function Sidebar({ active, onSelect, ownerName, onSignOut }) {
  return (
    <aside className="absolute top-0 bottom-0 left-[1102px] w-[338px] bg-brand text-white">
      <img src="/logo.png" alt="" className="absolute top-[32px] left-[220px] h-[91px] w-[69.36px] object-contain" />
      <div className="absolute top-[10px] left-[115px] flex h-[103px] w-[100px] items-center justify-end whitespace-nowrap text-[46px] leading-none font-bold">
        لبيــك
      </div>
      <div className="absolute top-[109px] left-[98px] w-[119px] text-right text-[14px] leading-[19px] whitespace-nowrap">لوحة تحكم المالك</div>

      <nav className="absolute top-[165px] left-[34px] flex w-[286px] flex-col gap-[16px]">
        {NAV.map(([key, label, Icon, soon]) => {
          const selected = key === active
          return (
            <button
              key={key}
              type="button"
              // aria-disabled مش disabled: عشان التلميح «قريباً» يبين
              aria-disabled={soon || undefined}
              title={soon ? 'قريباً' : undefined}
              onClick={() => !soon && onSelect(key)}
              className={`flex h-[62px] items-center gap-[12px] rounded-[16px] pr-[38px] text-[20px] ${selected ? 'bg-white text-brand' : soon ? 'cursor-not-allowed text-white/45' : 'text-white hover:bg-white/10'}`}
            >
              <Icon size={24} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={() => window.confirm('تسجيل الخروج من لوحة التحكم؟') && onSignOut()}
        title="تسجيل الخروج"
        className="absolute top-[891px] left-[17px] flex h-[89px] w-[304px] items-center gap-[9px] rounded-[16px] bg-[rgba(238,242,242,0.29)] pr-[10px] text-right"
      >
        <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-avatar text-[28px] leading-none font-bold">
          {(ownerName || 'م').trim().charAt(0)}
        </span>
        <span className="flex flex-col">
          <span className="text-[18px] leading-[26px] font-semibold">المالك العام</span>
          <span className="text-[12px] leading-[19px] text-white/80">صلاحيات كاملة</span>
        </span>
      </button>
    </aside>
  )
}
