import { CloseIcon, ChevronLeft, ChevronRight } from '../Icons'
import CompanyRow from '../dashboard/CompanyRow'

// -------------------------------------------------------------
// جدول صفحة «الشركات» (Figma: كرت أبيض 1038×620 عند 46,326 — radius 16 بظل):
//   شريط العناوين الرمادي 1001×46 (16,15 — #DDE3E3 radius 8): الشركة · تاريخ الاشتراك ونهايته · الحالة · الإجراءات (18 #717171)
//   الصفوف نفس صفوف لوحة التحكم (81 طول وفراغ 25) — ٥ بكل صفحة
//   الأسهم تحت الكرت (y970): ">" يمين = الصفحة اللي قبل، "<" يسار = اللي بعد (RTL) — ما بيطلعوا إذا صفحة وحدة
// -------------------------------------------------------------
export const PAGE_SIZE = 5

export default function CompaniesTable({ companies, page, onPage, loading, error, onRetry, onOpen, onToggle, busyId, toggleError, onDismissToggleError }) {
  const pages = Math.max(1, Math.ceil(companies.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const rows = companies.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)
  return (
    <>
      <section className="absolute top-[326px] left-[46px] h-[620px] w-[1038px] rounded-[16px] bg-white shadow-card">
        <div className="absolute top-[15px] left-[16px] h-[46px] w-[1001px] rounded-[8px] bg-[#DDE3E3] text-[18px] leading-[46px] text-muted">
          <span className="absolute right-[13px]">الشركة</span>
          <span className="absolute left-[405px] w-[212px] text-center">تاريخ الاشتراك ونهايته</span>
          <span className="absolute left-[223px] w-[93px] text-center">الحالة</span>
          <span className="absolute left-[16px] w-[118px] text-center">الإجراءات</span>
        </div>

        <div className="absolute top-[92px] left-[25px] h-[505px] w-[992px]">
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
              {rows.map((c) => (
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

      {pages > 1 && (
        <>
          <PageArrow label="الصفحة السابقة" className="left-[1050px]" disabled={current === 0} onClick={() => onPage(current - 1)}>
            <ChevronRight size={28} />
          </PageArrow>
          <PageArrow label="الصفحة التالية" className="left-[44px]" disabled={current >= pages - 1} onClick={() => onPage(current + 1)}>
            <ChevronLeft size={28} />
          </PageArrow>
        </>
      )}
    </>
  )
}

const PageArrow = ({ label, className, disabled, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className={`absolute top-[966px] flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-ink hover:bg-black/5 disabled:text-black/20 disabled:hover:bg-transparent ${className}`}
  >
    {children}
  </button>
)

const Message = ({ children }) => <p className="m-0 pt-[40px] text-center text-[16px] text-muted">{children}</p>
