import { CompanyStatus } from '../../api/admin'
import { CloseIcon } from '../Icons'
import CompanyRow from './CompanyRow'

// -------------------------------------------------------------
// «إدارة الشركات» (Figma: 1038×687 عند 46,319 — أبيض radius 16):
//   الرأس 992×39 (24,31): العنوان 24 Bold + تبويبات 97×39 (فراغ 11) — المختار #113A2E والباقي #EEF2F2 / #717171
//   عناوين الأعمدة 18 #717171 (y99) — الصفوف 991 عرض من (25,154): 81 طول وفراغ 25
// [toggleError] خطأ الإيقاف / التفعيل: شريط تحت بينسكّر، والجدول بيضل ظاهر ([error] بس لخطأ التحميل)
// -------------------------------------------------------------
const TABS = [
  ['all', 'الكل'],
  [CompanyStatus.Active, 'مفعّل'],
  [CompanyStatus.Stopped, 'متوقف'],
  [CompanyStatus.Expired, 'منتهي'],
]

export default function CompaniesPanel({ companies, tab, onTab, loading, error, onRetry, onOpen, onToggle, busyId, toggleError, onDismissToggleError }) {
  return (
    <section className="absolute top-[319px] left-[46px] h-[687px] w-[1038px] rounded-[16px] bg-white shadow-card">
      <div className="absolute top-[31px] left-[24px] flex h-[39px] w-[992px] items-center justify-between">
        <h2 className="m-0 text-[24px] leading-[39px] font-bold">إدارة الشركات</h2>
        <div className="flex gap-[11px]">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onTab(key)}
              className={`h-[39px] w-[97px] rounded-[10px] text-[16px] ${tab === key ? 'bg-brand text-white' : 'bg-soft text-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* عناوين الأعمدة — بمراكز أعمدة الصفوف */}
      <div className="absolute top-[99px] left-0 h-[32px] w-full text-[18px] leading-[32px] text-muted">
        <span className="absolute right-[129px]">الشركة</span>
        <span className="absolute left-[414px] w-[212px] text-center">تاريخ الاشتراك ونهايته</span>
        <span className="absolute left-[232px] w-[93px] text-center">الحالة</span>
        <span className="absolute left-[25px] w-[118px] text-center">الإجراءات</span>
      </div>

      <div className="absolute top-[154px] left-[25px] h-[505px] w-[992px] overflow-y-auto">
        {loading ? (
          <Message>جارٍ التحميل…</Message>
        ) : error ? (
          <Message>
            {error}{' '}
            <button type="button" onClick={onRetry} className="text-brand underline">
              إعادة المحاولة
            </button>
          </Message>
        ) : companies.length === 0 ? (
          <Message>لا توجد شركات</Message>
        ) : (
          <div className="flex flex-col gap-[25px]">
            {companies.map((c) => (
              <CompanyRow key={c.id} company={c} onOpen={onOpen} onToggle={onToggle} busy={busyId === c.id} />
            ))}
          </div>
        )}
      </div>

      {toggleError && (
        <div role="alert" className="absolute bottom-[16px] left-1/2 z-10 flex min-h-[48px] w-max max-w-[900px] -translate-x-1/2 items-center gap-[12px] rounded-[12px] bg-badBg py-[8px] pr-[20px] pl-[10px] text-[16px] text-dangerText shadow-card">
          <span>{toggleError}</span>
          <button type="button" onClick={onDismissToggleError} aria-label="إغلاق" className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px] hover:bg-black/5">
            <CloseIcon size={18} />
          </button>
        </div>
      )}
    </section>
  )
}

const Message = ({ children }) => <p className="m-0 pt-[40px] text-center text-[16px] text-muted">{children}</p>
