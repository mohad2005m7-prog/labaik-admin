import { useState } from 'react'
import { Category, createCompany, YEARLY } from '../../api/admin'
import { errorText, upload } from '../../api/client'
import { arNum, dayDiff, latinDigits, plusYear, todayIso } from '../../lib/format'
import { CheckIcon, CloseIcon, CopyIcon, ImageIcon, SearchIcon } from '../Icons'
import Modal from '../Modal'
import { DateInput, Field, FilePicker, PhoneInput, Row, Section, Select, TextInput } from './Fields'

// -------------------------------------------------------------
// «إضافة شركة جديدة» (Figma 883:4592 — 1217 عرض):
//   رأس ثابت 210 #113A2E — 6 أقسام 1168 عرض (#EEF2F2) — حفظ وإضافة الشركة 925×90 + إلغاء 147×90
// بيتبعت POST /admin/companies (CreateCompanyCommand):
//   name · commercialRegistrationNumber · contactFullName · ownerEmail مطلوبين
//   ownerEmail = «البريد الإلكتروني الرسمي» (هو اللي بيوصله إيميل الدخول وكلمة المرور المؤقتة من الخادم)
//   الدولة برمز ISO (زي التطبيق) ومفتاح الهاتف حسبها
//   temporaryPassword (الكلمة المولّدة هون) / forcePasswordChange / sendCredentialsByEmail — الخادم بيستعملهم لحساب المالك الجديد
//   والرد فيه temporaryPassword مرة وحدة — لو null فالبريد مسجّل من قبل والمالك بيدخل بكلمته الحالية
//   الشعار والعقد بينرفعوا أول (POST /files) وبينبعت رابطهم logoUrl / contractFileUrl
// الاشتراك سنوي: النهاية = البداية + سنة
// -------------------------------------------------------------
const CATEGORIES = [
  [Category.HajjAndUmrah, 'حج و عمرة'],
  [Category.Hajj, 'حج فقط'],
  [Category.Umrah, 'عمرة فقط'],
]

// [رمز ISO، الاسم، مفتاح الهاتف]
const COUNTRIES = [
  ['SA', 'السعودية', '+966'],
  ['PS', 'فلسطين', '+970'],
  ['JO', 'الأردن', '+962'],
  ['EG', 'مصر', '+20'],
  ['AE', 'الإمارات', '+971'],
  ['QA', 'قطر', '+974'],
  ['KW', 'الكويت', '+965'],
  ['BH', 'البحرين', '+973'],
  ['OM', 'عُمان', '+968'],
  ['IQ', 'العراق', '+964'],
  ['LB', 'لبنان', '+961'],
  ['SY', 'سوريا', '+963'],
  ['YE', 'اليمن', '+967'],
  ['TR', 'تركيا', '+90'],
  ['MA', 'المغرب', '+212'],
  ['DZ', 'الجزائر', '+213'],
  ['TN', 'تونس', '+216'],
  ['LY', 'ليبيا', '+218'],
  ['SD', 'السودان', '+249'],
]

const empty = () => ({
  country: 'SA',
  city: '',
  name: '',
  category: Category.HajjAndUmrah,
  officialEmail: '',
  phone: '',
  period: null,
  price: '',
  reference: '',
  start: todayIso(),
  maxPilgrims: '',
  maxSupervisors: '',
  registration: '',
  vat: '',
  contactName: '',
  jobTitle: '',
  mobile: '',
  forceChange: true,
  sendEmail: true,
})

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789+#@!'
  const bytes = crypto.getRandomValues(new Uint32Array(12))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

export default function AddCompanyDialog({ onClose, onCreated }) {
  const [f, setF] = useState(empty)
  const [password, setPassword] = useState(generatePassword)
  const [logo, setLogo] = useState(null)
  const [contract, setContract] = useState(null)
  // الشركة انضافت بس البريد كان مسجّل (ما انعملت كلمة مؤقتة) — بنوضّح قبل ما نسكّر
  const [linkedNotice, setLinkedNotice] = useState(false)
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (key) => (value) => setF((s) => ({ ...s, [key]: value?.target ? value.target.value : value }))

  const end = f.start ? plusYear(f.start) : ''
  const daysLeft = end ? dayDiff(new Date(), end) : null
  const missing = { name: !f.name.trim(), registration: !f.registration.trim(), contactName: !f.contactName.trim(), officialEmail: !/^\S+@\S+\.\S+$/.test(f.officialEmail) }

  async function submit() {
    setTried(true)
    setError('')
    if (Object.values(missing).some(Boolean)) {
      setError('أكمل الحقول المطلوبة')
      return
    }
    const num = (v) => (String(v).trim() === '' ? null : Number(v))
    const dial = COUNTRIES.find(([code]) => code === f.country)?.[2] ?? '+966'
    // الرقم بلا صفر البداية (05x → 5x) بعد مفتاح الدولة
    const phone = (v) => (v.trim() ? `${dial}${v.replace(/\s/g, '').replace(/^0+/, '')}` : null)
    setSaving(true)
    try {
      const [logoUrl, contractFileUrl] = await Promise.all([logo ? upload(logo) : null, contract ? upload(contract) : null])
      const created = await createCompany({
        name: f.name.trim(),
        commercialRegistrationNumber: f.registration.trim(),
        contactFullName: f.contactName.trim(),
        ownerEmail: f.officialEmail.trim(),
        category: f.category,
        officialEmail: f.officialEmail.trim(),
        primaryPhone: phone(f.phone),
        country: f.country,
        city: f.city.trim() || null,
        vatId: f.vat.trim() || null,
        contractReferenceNumber: f.reference.trim() || null,
        subscriptionPrice: num(f.price),
        subscriptionPeriod: YEARLY,
        contractStartDate: f.start || null,
        contractEndDate: end || null,
        maxSupervisors: num(f.maxSupervisors),
        maxPilgrims: num(f.maxPilgrims),
        contactJobTitle: f.jobTitle.trim() || null,
        contactMobile: phone(f.mobile),
        logoUrl,
        contractFileUrl,
        temporaryPassword: password,
        forcePasswordChange: f.forceChange,
        sendCredentialsByEmail: f.sendEmail,
      })
      if (created && !created.temporaryPassword) {
        setLinkedNotice(true)
        setSaving(false)
        return
      }
      onCreated()
    } catch (e) {
      setError(errorText(e))
      setSaving(false)
    }
  }

  const header = (
    <header className="relative h-[210px] shrink-0 rounded-t-[16px] bg-brand text-white">
      <div className="absolute top-[54px] right-[72px] text-right">
        <h1 className="m-0 text-[32px] leading-[46px] font-bold">إضافة شركة جديدة</h1>
        <p className="m-0 mt-[8px] text-[20px] leading-[30px]">أدخل بيانات الشركة والعقد الجديد لربطها بلوحة التحكم.</p>
      </div>
      <button type="button" onClick={onClose} aria-label="إغلاق" className="absolute top-[62px] left-[91px] flex h-[63px] w-[63px] items-center justify-center rounded-[12px] border-[1.5px] border-white">
        <CloseIcon size={26} />
      </button>
    </header>
  )

  return (
    <Modal width={1217} header={header} onClose={onClose} radius={16}>
      <div className="flex flex-col gap-[40px] px-[24px] pt-[33px]">
        <Section number="١" title="المعلومات الأساسية للشركة">
          <Field label="اسم الشركة" className="w-full">
            <div className={`flex h-[56px] items-center gap-[10px] rounded-[10px] bg-white px-[16px] ${tried && missing.name ? 'ring-2 ring-danger' : ''}`}>
              <SearchIcon size={20} className="shrink-0 text-icon" />
              <input value={f.name} onChange={set('name')} placeholder="أدخل اسم الشركة ، مثال: شركة الرحمة للحج والعمرة" className="h-full flex-1 bg-transparent text-[16px] outline-none" />
            </div>
          </Field>

          <Field label="شعار الشركة" className="w-full">
            <FilePicker accept="image/png,image/jpeg" fileName={logo?.name ?? ''} onPick={setLogo}>
              {(inputId, name) => (
                <div className="flex h-[140px] items-center justify-between rounded-[12px] border border-[#D9D9D9] px-[12px]">
                  <div className="flex items-center gap-[20px]">
                    <span className="flex h-[112px] w-[112px] items-center justify-center rounded-[12px] bg-white text-icon">
                      <ImageIcon size={40} />
                    </span>
                    <span className="flex flex-col gap-[8px]">
                      <span className="text-[16px]">{name || 'اسحب الشعار وأفلته هنا، أو اخترها من جهازك'}</span>
                      <span className="text-[14px]">PNG أو JPG، حتى ٢ ميجابايت</span>
                    </span>
                  </div>
                  <label htmlFor={inputId} className="ml-[56px] flex h-[51px] w-[159px] cursor-pointer items-center justify-center rounded-[10px] border border-line bg-white text-[16px]">
                    اختيار الملف
                  </label>
                </div>
              )}
            </FilePicker>
          </Field>

          <Row>
            <Field label="التصنيف / النشاط">
              <Select value={f.category} options={CATEGORIES} onChange={set('category')} />
            </Field>
            <Field label="البريد الإلكتروني الرسمي" required>
              <TextInput value={f.officialEmail} onChange={set('officialEmail')} placeholder="info@company.com" dir="ltr" type="email" invalid={tried && missing.officialEmail} />
            </Field>
          </Row>

          <Row>
            <Field label="الدولة">
              <Select value={f.country} options={COUNTRIES.map(([code, name]) => [code, name])} onChange={set('country')} />
            </Field>
            <Field label="المدينة">
              <TextInput value={f.city} onChange={set('city')} placeholder="مثال: مكة المكرمة" />
            </Field>
          </Row>

          <Field label="رقم الهاتف الأساسي" className="w-full">
            <PhoneInput value={f.phone} onChange={set('phone')} dial={COUNTRIES.find(([code]) => code === f.country)?.[2]} />
          </Field>
        </Section>

        <Section number="٢" title="بيانات العقد والاشتراك">
          <Row>
            <Field label="اختر مدة الاشتراك">
              <Select value={f.period} options={[[YEARLY, 'سنوي']]} placeholder="اختر المدة" onChange={set('period')} />
            </Field>
            <Field label="قيمة الاشتراك / السعر">
              <div className="flex items-center gap-[10px]" dir="ltr">
                <span className="text-[18px] text-muted">SAR</span>
                <TextInput value={f.price} onChange={(e) => set('price')(latinDigits(e.target.value).replace('٫', '.').replace(/[^\d.]/g, ''))} placeholder="0" inputMode="decimal" />
              </div>
            </Field>
          </Row>
          <Field label="رقم العقد المرجعي">
            <TextInput value={f.reference} onChange={set('reference')} placeholder="CNT-2026-007" dir="ltr" className="text-right" />
          </Field>
          <Row>
            <Field label="تاريخ بدء العقد">
              <DateInput value={f.start} onChange={set('start')} />
            </Field>
            <Field label="تاريخ انتهاء العقد" hint={daysLeft != null && daysLeft >= 0 ? <span className="block text-right">تنتهي خلال {arNum(daysLeft)} يوماً</span> : null}>
              <DateInput value={end} readOnly />
            </Field>
          </Row>
        </Section>

        <Section number="٣" title="قيود السعة والاستخدام">
          <Row>
            <Field label="الحد الأقصى لعدد المعتمرين">
              <TextInput value={f.maxPilgrims} onChange={(e) => set('maxPilgrims')(latinDigits(e.target.value).replace(/\D/g, ''))} placeholder="مثال:5000" inputMode="numeric" />
            </Field>
            <Field label="الحد الأقصى لعدد المشرفين / الإداريين">
              <TextInput value={f.maxSupervisors} onChange={(e) => set('maxSupervisors')(latinDigits(e.target.value).replace(/\D/g, ''))} placeholder="مثال:10" inputMode="numeric" />
            </Field>
          </Row>
        </Section>

        <Section number="٤" title="البيانات الرسمية والضريبية">
          <Row>
            <Field label="رقم الترخيص / السجل التجاري" required>
              <TextInput value={f.registration} onChange={set('registration')} invalid={tried && missing.registration} />
            </Field>
            <Field label="الرقم الضريبي (VAT ID)" hint="15 رقماً">
              <TextInput value={f.vat} onChange={(e) => set('vat')(e.target.value.replace(/\D/g, '').slice(0, 15))} inputMode="numeric" dir="ltr" />
            </Field>
          </Row>
          <Field label="ملف العقد المبرم (PDF)" className="w-full">
            <FilePicker accept="application/pdf" fileName={contract?.name ?? ''} onPick={setContract}>
              {(inputId, name) => (
                <div className="flex h-[56px] items-center justify-between rounded-[10px] bg-white px-[16px] text-[16px]">
                  <span className={name ? '' : 'text-hint'}>{name || 'لم يتم اختيار الملف'}</span>
                  <label htmlFor={inputId} className="cursor-pointer text-[18px]">
                    اختيار الملف
                  </label>
                </div>
              )}
            </FilePicker>
          </Field>
        </Section>

        <Section number="٥" title="بيانات المسؤول المفوّض">
          <Row>
            <Field label="اسم المسؤول الكامل" required>
              <TextInput value={f.contactName} onChange={set('contactName')} invalid={tried && missing.contactName} />
            </Field>
            <Field label="المسمى الوظيفي">
              <TextInput value={f.jobTitle} onChange={set('jobTitle')} placeholder="مدير الحسابات / المدير التنفيذي" />
            </Field>
          </Row>
          <Field label="رقم جوال المسؤول" className="w-full">
            <PhoneInput value={f.mobile} onChange={set('mobile')} dial={COUNTRIES.find(([code]) => code === f.country)?.[2]} />
          </Field>
        </Section>

        <Section number="٦" title="الإعدادات والرحلة">
          <Field label={<>كلمة المرور المؤقتة <span className="text-[#FF0000]">*</span></>} className="w-full">
            <div className="flex items-center gap-[16px]">
              <div className="flex h-[66px] flex-1 items-center rounded-[10px] bg-white px-[22px] text-[20px] text-hint" dir="ltr">
                {password}
              </div>
              <button type="button" onClick={() => navigator.clipboard?.writeText(password)} aria-label="نسخ" className="flex h-[58px] w-[58px] items-center justify-center rounded-[10px] bg-white text-ink">
                <CopyIcon size={24} />
              </button>
              <button type="button" onClick={() => setPassword(generatePassword())} className="h-[69px] w-[247px] rounded-[12px] bg-brand text-[22px] font-semibold text-white">
                توليد كلمة المرور
              </button>
            </div>
          </Field>
          <div className="-mt-[14px] flex items-center gap-[40px]">
            <div className="flex flex-1 gap-[40px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="h-[5px] flex-1 rounded-full bg-brand" />
              ))}
            </div>
            <span className="text-[22px]">قوية جداً</span>
          </div>
          <div className="mt-[20px] flex flex-col gap-[16px] text-[20px]">
            <Check checked={f.forceChange} onChange={set('forceChange')}>
              إجبار الشركة على تغيير كلمة المرور فور أول تسجيل دخول
            </Check>
            <Check checked={f.sendEmail} onChange={set('sendEmail')}>
              إرسال بيانات الدخول ورابط المنصة تلقائياً عبر البريد الإلكتروني للشركة
            </Check>
          </div>
        </Section>

        {error && <p className="m-0 text-center text-[18px] text-danger">{error}</p>}
        {linkedNotice && (
          <p className="m-0 text-center text-[18px] text-okText">
            تمت إضافة الشركة. البريد الرسمي مسجّل مسبقاً في لبيك، فسيدخل المالك بكلمة مروره الحالية (لم تُستخدم الكلمة المؤقتة).
          </p>
        )}

        {linkedNotice ? (
          <div className="flex gap-[8px] pr-[45px] pb-[40px] pl-[41px]">
            <button type="button" onClick={onCreated} className="h-[90px] flex-1 rounded-[12px] bg-brand text-[32px] font-bold text-white">
              تم
            </button>
          </div>
        ) : (
          <div className="flex gap-[8px] pr-[45px] pb-[40px] pl-[41px]">
            <button type="button" disabled={saving} onClick={submit} className="h-[90px] flex-1 rounded-[12px] bg-brand text-[32px] font-bold text-white disabled:opacity-60">
              {saving ? 'جارٍ الحفظ…' : 'حفظ وإضافة الشركة'}
            </button>
            <button type="button" onClick={onClose} className="h-[90px] w-[147px] rounded-[12px] border border-line bg-white text-[24px] text-muted">
              إلغاء
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

function Check({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-[12px]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-[4px] ${checked ? 'bg-brand text-white' : 'border-2 border-icon'}`}>
        {checked && <CheckIcon size={16} />}
      </span>
      {children}
    </label>
  )
}
