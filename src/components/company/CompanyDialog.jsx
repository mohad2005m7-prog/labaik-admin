import { useEffect, useState } from 'react'
import { Category, SERVICES, company as fetchCompany, deleteCompany, issueTempPassword, resumeCompany, stopCompany, toUpdateRequest, updateCompany, YEARLY } from '../../api/admin'
import { errorText } from '../../api/client'
import { arNum, plusYear, slashDate } from '../../lib/format'
import { CloseIcon, CopyIcon, PlusIcon } from '../Icons'
import Modal from '../Modal'
import StatusPill from '../StatusPill'
import Toggle from '../Toggle'
import { Logo } from '../dashboard/CompanyRow'

// -------------------------------------------------------------
// تفاصيل الشركة (Figma 906:5209 — 661 عرض):
//   رأس ثابت 137 #113A2E: الشعار 88 + الاسم 22 + الحالة — زر الإغلاق 62×62 بحد أبيض
//   كروت 593 عرض (حد #EAEAEA، radius 16، padding 28):
//     حالة الحساب (130) · الخدمات المفعّلة (423) · كلمة مرور مؤقتة (196) · فترة الاشتراك (183)
//   أسفل ثابت: إلغاء 182×62 + حفظ التغييرات 417×62
// الاشتراك سنوي بس: زر «+ سنة» بيمدّ الانتهاء سنة من تاريخ الانتهاء الحالي
// (مش بـ Figma) «بيانات الشركة» وأرقامها من AdminCompanyDto، و«حذف الشركة» بتأكيد اسمها
// -------------------------------------------------------------
export default function CompanyDialog({ id, onClose, onSaved }) {
  const [dto, setDto] = useState(null)
  const [error, setError] = useState('')
  const [active, setActive] = useState(true)
  const [services, setServices] = useState({})
  const [end, setEnd] = useState(null)
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteNotice, setDeleteNotice] = useState('')
  // الخادم رفض لأن في رحلات جارية → بنعرض «حذف رغم ذلك» (force=true)
  const [needsForce, setNeedsForce] = useState(false)
  const [emailSent, setEmailSent] = useState(null)
  // إصدار كلمة مؤقتة شغّال — كل إصدار بيلغي اللي قبله، فما بدنا ضغطتين
  const [issuing, setIssuing] = useState(false)

  useEffect(() => {
    let alive = true
    fetchCompany(id)
      .then((d) => {
        if (!alive) return
        setDto(d)
        setActive(!d.isStopped)
        setServices({ ...(d.enabledServices ?? {}) })
        setEnd(d.contractEndDate ?? null)
      })
      .catch((e) => alive && setError(errorText(e)))
    return () => {
      alive = false
    }
  }, [id])

  async function issue() {
    if (issuing) return
    setIssuing(true)
    setNotice('')
    try {
      const r = await issueTempPassword(id)
      setPassword(r?.temporaryPassword ?? '')
      setEmailSent(r?.emailSent ?? null)
    } catch (e) {
      setNotice(e.status === 405 ? 'إصدار كلمة مؤقتة غير متاح على الخادم بعد' : errorText(e))
    } finally {
      setIssuing(false)
    }
  }

  async function remove(force = false) {
    if (!dto || confirmName.trim() !== dto.name.trim()) return
    setDeleting(true)
    setDeleteNotice('')
    try {
      await deleteCompany(id, force)
      onSaved()
    } catch (e) {
      if (e.code === 'Company.HasActiveTrips' && !force) {
        setNeedsForce(true)
        setDeleteNotice('لدى الشركة رحلات جارية الآن. الحذف سيوقف حسابها وحسابات مشرفيها أثناء الرحلة.')
      } else {
        setDeleteNotice(e.status === 405 ? 'حذف الشركة غير متاح على الخادم بعد' : errorText(e))
      }
      setDeleting(false)
    }
  }

  async function save() {
    if (!dto) return
    setSaving(true)
    setNotice('')
    try {
      const servicesChanged = SERVICES.some(([k]) => Boolean(services[k]) !== Boolean(dto.enabledServices?.[k]))
      if (servicesChanged || end !== dto.contractEndDate) {
        await updateCompany(id, toUpdateRequest(dto, { enabledServices: services, contractEndDate: end, subscriptionPeriod: dto.subscriptionPeriod ?? YEARLY }))
      }
      if (active === dto.isStopped) await (active ? resumeCompany(id) : stopCompany(id))
      onSaved()
    } catch (e) {
      setNotice(errorText(e))
      setSaving(false)
    }
  }

  const header = (
    <header className="relative h-[137px] shrink-0 bg-brand text-white">
      <div className="absolute top-[24px] right-[32px] flex items-center gap-[13px]">
        <Logo company={dto} size={88} />
        <div className="flex flex-col items-start gap-[6px]">
          <span className="text-[22px] leading-[32px] font-bold">{dto?.name ?? '…'}</span>
          {dto && <StatusPill status={dto.status} className="h-[28px] w-[86px] text-[14px]" />}
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label="إغلاق" className="absolute top-[37px] left-[31px] flex h-[62px] w-[62px] items-center justify-center rounded-[12px] border-[1.5px] border-white">
        <CloseIcon size={26} />
      </button>
    </header>
  )

  const footer = (
    <footer className="flex h-[71px] shrink-0 items-center gap-[14px] border-t border-line pr-[22px] pl-[25px]">
      <button type="button" disabled={!dto || saving} onClick={save} className="h-[62px] w-[417px] rounded-[12px] bg-brand text-[20px] font-semibold text-white disabled:opacity-60">
        {saving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
      </button>
      <button type="button" onClick={onClose} className="h-[62px] w-[182px] rounded-[12px] border border-line bg-white text-[20px] text-muted">
        إلغاء
      </button>
    </footer>
  )

  return (
    <Modal width={661} header={header} footer={footer} onClose={onClose}>
      {error ? (
        <p className="p-[40px] text-center text-[16px] text-muted">{error}</p>
      ) : !dto ? (
        <p className="p-[40px] text-center text-[16px] text-muted">جارٍ التحميل…</p>
      ) : (
        <div className="flex flex-col gap-[24px] px-[34px] pt-[26px] pb-[28px]">
          <Card className="min-h-[130px]">
            <div className="flex items-start justify-between gap-[20px]">
              <div>
                <Title>حالة الحساب</Title>
                <p className="m-0 mt-[6px] text-[14px] leading-[22px] text-muted">عند الإيقاف لا تستطيع الشركة تسجيل الدخول ولا يظهر لمعتمريها أي محتوى.</p>
              </div>
              <Toggle on={active} onChange={setActive} label="حالة الحساب" />
            </div>
          </Card>

          <Card>
            <Title>بيانات الشركة</Title>
            <dl className="m-0 mt-[14px] grid grid-cols-2 gap-x-[24px] gap-y-[12px] text-[15px]">
              <Info label="بريد المالك" value={dto.ownerEmail} ltr />
              <Info label="السجل التجاري" value={dto.commercialRegistrationNumber} ltr />
              <Info label="المسؤول" value={dto.contactFullName} />
              <Info label="الهاتف" value={dto.primaryPhone || dto.contactMobile} ltr />
              <Info label="الفئة" value={CATEGORY[dto.category]} />
              <Info label="المدينة" value={[dto.city, COUNTRY[dto.country?.toUpperCase()] ?? dto.country].filter(Boolean).join('، ')} />
            </dl>
            <div className="mt-[18px] grid grid-cols-5 gap-[8px] text-center">
              {[
                ['رحلات', dto.stats?.tripsCount],
                ['نشطة', dto.stats?.activeTripsCount],
                ['مجموعات', dto.stats?.groupsCount],
                ['مشرفون', dto.stats?.supervisorsCount],
                ['معتمر نشط', dto.stats?.activePilgrims],
              ].map(([label, n]) => (
                <div key={label} className="rounded-[10px] bg-soft py-[10px]">
                  <div className="text-[20px] leading-[28px] font-bold">{arNum(n)}</div>
                  <div className="text-[12px] text-muted">{label}</div>
                </div>
              ))}
            </div>
            {dto.maxPilgrims || dto.maxSupervisors ? (
              <Sub>
                الحد: {dto.maxPilgrims ? `${arNum(dto.maxPilgrims)} معتمر` : '—'} · {dto.maxSupervisors ? `${arNum(dto.maxSupervisors)} مشرف` : '—'}
              </Sub>
            ) : null}
          </Card>

          <Card>
            <Title>الخدمات المفعّلة</Title>
            <Sub>فعّل أو أغلق الخدمات المتاحة لهذه الشركة.</Sub>
            <div className="mt-[18px] flex flex-col">
              {SERVICES.map(([key, label]) => (
                <div key={key} className="flex h-[60.5px] items-center justify-between text-[16px]">
                  <span>{label}</span>
                  <Toggle on={Boolean(services[key])} onChange={(on) => setServices((s) => ({ ...s, [key]: on }))} label={label} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Title>كلمة مرور مؤقتة</Title>
            <Sub>إذا نسي مالك الشركة كلمة المرور، أصدر كلمة مؤقتة وسيُطلب منه تغييرها عند أول دخول.</Sub>
            <div className="mt-[20px] flex items-center justify-between">
              <div className={`flex h-[54px] w-[270px] items-center rounded-[10px] bg-soft px-[16px] text-[16px] ${password ? 'text-ink' : 'text-hint'}`} dir={password ? 'ltr' : 'rtl'}>
                {password || 'لم تصدر بعد'}
              </div>
              <div className="flex items-center gap-[11px]">
                <button type="button" onClick={issue} disabled={issuing} className="h-[54px] w-[128px] rounded-[10px] bg-brand text-[18px] font-semibold text-white disabled:opacity-60">
                  {issuing ? 'لحظة…' : 'إصدار'}
                </button>
                <button
                  type="button"
                  disabled={!password}
                  onClick={() => navigator.clipboard?.writeText(password)}
                  aria-label="نسخ"
                  className="flex h-[54px] w-[58px] items-center justify-center rounded-[10px] border border-line bg-white text-icon disabled:opacity-50"
                >
                  <CopyIcon size={22} />
                </button>
              </div>
            </div>
          </Card>

          {password && emailSent !== null && (
            <p className={`-mt-[14px] mb-0 text-[13px] ${emailSent ? 'text-okText' : 'text-danger'}`}>
              {emailSent ? 'أُرسلت إلى بريد المالك أيضاً.' : 'تعذّر إرسال البريد، أرسلها للمالك بنفسك.'}
            </p>
          )}

          <Card>
            <Title>فترة الاشتراك</Title>
            <Sub>
              من {slashDate(dto.contractStartDate)} إلى {slashDate(end)} ، مدّة الاشتراك من تاريخ الانتهاء الحالي.
            </Sub>
            <div className="mt-[20px] flex gap-[8px]">
              <button
                type="button"
                disabled={!end}
                onClick={() => setEnd(plusYear(end))}
                className="flex h-[45px] w-[113px] items-center justify-center gap-[6px] rounded-[10px] border border-line bg-white text-[16px] disabled:opacity-50"
              >
                <PlusIcon size={18} />
                سنة
              </button>
            </div>
          </Card>

          <Card className="border-danger/40">
            <Title>حذف الشركة</Title>
            <Sub>يُعطَّل حساب الشركة ومشرفيها ولا تظهر في اللوحة. للتأكيد اكتب اسم الشركة كما هو: «{dto.name}»</Sub>
            <div className="mt-[16px] flex items-center gap-[11px]">
              <input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="اسم الشركة"
                className="h-[54px] min-w-0 flex-1 rounded-[10px] border border-line px-[16px] text-[16px] outline-none focus:border-danger"
              />
              <button
                type="button"
                onClick={() => remove(false)}
                disabled={deleting || confirmName.trim() !== dto.name.trim()}
                className="h-[54px] w-[128px] shrink-0 rounded-[10px] bg-danger text-[18px] font-semibold text-white disabled:opacity-40"
              >
                {deleting ? 'جارٍ الحذف…' : 'حذف'}
              </button>
            </div>
            {deleteNotice && <p className="m-0 mt-[10px] text-[14px] text-danger">{deleteNotice}</p>}
            {needsForce && (
              <button
                type="button"
                onClick={() => remove(true)}
                disabled={deleting || confirmName.trim() !== dto.name.trim()}
                className="mt-[10px] h-[48px] w-full rounded-[10px] border border-danger bg-white text-[16px] font-semibold text-danger disabled:opacity-40"
              >
                {deleting ? 'جارٍ الحذف…' : 'حذف رغم وجود رحلات جارية'}
              </button>
            )}
          </Card>

          {notice && <p className="m-0 text-center text-[14px] text-danger">{notice}</p>}
        </div>
      )}
    </Modal>
  )
}

// الدولة محفوظة برمز ISO (زي التطبيق) — بنعرض الاسم
const COUNTRY = { PS: 'فلسطين', JO: 'الأردن', SA: 'السعودية', EG: 'مصر', AE: 'الإمارات', QA: 'قطر', KW: 'الكويت', BH: 'البحرين', OM: 'عُمان', LB: 'لبنان', SY: 'سوريا', IQ: 'العراق', YE: 'اليمن', TR: 'تركيا', MA: 'المغرب', DZ: 'الجزائر', TN: 'تونس', LY: 'ليبيا', SD: 'السودان' }

const CATEGORY = { [Category.Umrah]: 'عمرة', [Category.Hajj]: 'حج', [Category.HajjAndUmrah]: 'حج وعمرة' }

const Info = ({ label, value, ltr }) => (
  <div className="flex min-w-0 flex-col">
    <dt className="text-[12px] text-muted">{label}</dt>
    <dd className="m-0 truncate" dir={ltr && value ? 'ltr' : undefined} style={ltr && value ? { textAlign: 'right' } : undefined}>
      {value || '—'}
    </dd>
  </div>
)

const Card = ({ children, className = '' }) => <div className={`rounded-[16px] border border-line bg-white p-[28px] ${className}`}>{children}</div>
const Title = ({ children }) => <h3 className="m-0 text-[20px] leading-[30px] font-bold">{children}</h3>
const Sub = ({ children }) => <p className="m-0 mt-[4px] text-[12px] leading-[19px] text-muted">{children}</p>
