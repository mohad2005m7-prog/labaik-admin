import { useEffect, useId, useRef, useState } from 'react'
import { latinDigits } from '../../lib/format'
import { CalendarIcon, ChevronDown, ChevronUp } from '../Icons'

// عناصر نموذج «إضافة شركة» (Figma 883:4592): الحقل أبيض 56 طول radius 10 — العنوان 20 أسود — * أحمر

export function Section({ number, title, children }) {
  return (
    <section className="bg-soft pt-[44px] pr-[44px] pb-[48px] pl-[140px]">
      <h2 className="m-0 mb-[34px] flex items-center gap-[12px] text-[32px] leading-[44px] font-bold">
        <span className="flex h-[41px] w-[41px] items-center justify-center rounded-[8px] bg-brand text-[24px] leading-none text-white">{number}</span>
        {title}
      </h2>
      <div className="flex flex-col gap-[34px]">{children}</div>
    </section>
  )
}

export const Row = ({ children }) => <div className="flex justify-between gap-[40px]">{children}</div>

export function Field({ label, required, hint, children, className = 'w-[380px]' }) {
  return (
    <div className={`flex flex-col gap-[14px] ${className}`}>
      <span className="text-[20px] leading-[28px]">
        {label}
        {required && <span className="text-[#FF0000]">*</span>}
      </span>
      {children}
      {hint && <span className="-mt-[8px] text-[12px] leading-[17px]">{hint}</span>}
    </div>
  )
}

const box = 'h-[56px] w-full rounded-[10px] bg-white px-[16px] text-[16px] outline-none focus:ring-2 focus:ring-brand/30'

export const TextInput = ({ invalid, ...props }) => <input {...props} className={`${box} ${invalid ? 'ring-2 ring-danger' : ''}`} />

/** +966 ثم الرقم (من اليسار لليمين متل Figma) */
/** [dial] مفتاح الدولة المختارة (+966 افتراضياً) */
export function PhoneInput({ value, onChange, dial = '+966' }) {
  return (
    <div className="flex h-[64px] w-full overflow-hidden rounded-[10px] bg-white" dir="ltr">
      <span className="flex w-[82px] items-center justify-center bg-[#F5F7F7] text-[20px] text-hint">{dial}</span>
      <input value={value} onChange={(e) => onChange(latinDigits(e.target.value).replace(/[^\d ]/g, ''))} placeholder="5x xxx xxxx" inputMode="tel" className="flex-1 bg-transparent px-[22px] text-[18px] outline-none" />
    </div>
  )
}

export function DateInput({ value, onChange, readOnly }) {
  return (
    <div className={`${box} flex items-center gap-[10px]`}>
      <input type="date" value={value} readOnly={readOnly} onChange={(e) => onChange?.(e.target.value)} className="h-full flex-1 bg-transparent text-right outline-none [&::-webkit-calendar-picker-indicator]:opacity-0" />
      <CalendarIcon size={22} className="shrink-0 text-icon" />
    </div>
  )
}

/** قائمة منسدلة بشكل Figma: المفتوحة رأسها #113A2E بنص أبيض وسهم لفوق، والخيارات بكرت أبيض radius 16 */
export function Select({ value, options, placeholder, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [open])
  const current = options.find(([v]) => v === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-[56px] w-full items-center justify-between rounded-[10px] px-[16px] text-[16px] ${open ? 'bg-brand text-white' : 'bg-white'}`}
      >
        <span className={!open && !current ? 'text-hint' : ''}>{current ? current[1] : placeholder}</span>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} className="text-icon" />}
      </button>
      {open && (
        <ul className="absolute top-[64px] right-0 z-10 m-0 w-full list-none rounded-[16px] bg-white p-[12px] shadow-card">
          {options.map(([v, label]) => (
            <li key={v}>
              <button
                type="button"
                onClick={() => {
                  onChange(v)
                  setOpen(false)
                }}
                className={`h-[52px] w-full rounded-[10px] px-[16px] text-right text-[18px] ${v === value ? 'bg-soft' : ''}`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** ملف من الجهاز (الشعار / العقد) — بنعرض الاسم بس: الخادم لسا ما فيه رفع ملفات */
export function FilePicker({ accept, fileName, onPick, children }) {
  const id = useId()
  return (
    <>
      <input id={id} type="file" accept={accept} hidden onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
      {children(id, fileName)}
    </>
  )
}
