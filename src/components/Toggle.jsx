// مفتاح Figma (48×24): مفعّل = مسار #113A2E والدائرة البيضا يسار — متوقّف = #BCBBBB والدائرة يمين
// [disabled] (شركة منتهية) = #EAEAEA باهت
export default function Toggle({ on, disabled = false, onChange, label }) {
  const track = disabled ? 'bg-line' : on ? 'bg-brand' : 'bg-off'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      className={`relative h-[24px] w-[48px] shrink-0 rounded-full transition-colors ${track}`}
    >
      <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all ${on && !disabled ? 'left-[4px]' : 'left-[26px]'}`} />
    </button>
  )
}
