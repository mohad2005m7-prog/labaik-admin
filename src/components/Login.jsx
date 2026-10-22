import { useState } from 'react'
import { changePassword, forgotPassword, login, resetPassword, signOut } from '../api/admin'
import { errorText } from '../api/client'

// تسجيل دخول المالك + نسيت كلمة المرور — ⚠️ مش موجودة بـ Figma: مبنية بنفس ألوان وخطوط اللوحة لحد ما تنصمّم
// الدخول بحساب دوره Admin (من إعدادات الخادم Admin:Emails)
// نسيت كلمة المرور: POST /auth/forgot-password ← رمز 6 أرقام بالإيميل ← POST /auth/reset-password
// كلمة مرور مؤقتة (mustChangePassword — حساب الأدمن الأول من الخادم): لازم يغيّرها قبل اللوحة (POST /auth/change-password)
//   [forceChange] = فتح الصفحة وهو لسا ما غيّرها (فبنطلب الحالية كمان) — أو الخادم رد 403 Auth.PasswordChangeRequired
//   [notice] = ليش طلع من اللوحة (حساب موقوف / لازم يغيّر كلمة المرور)
const input = 'h-[52px] rounded-[10px] border border-line px-[16px] text-right text-[16px] outline-none focus:border-brand'

export default function Login({ onSignedIn, forceChange = false, notice = '' }) {
  const [mode, setMode] = useState(forceChange ? 'change' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [current, setCurrent] = useState('')
  const [confirm, setConfirm] = useState('')
  // بنطلب الحالية بس لو ما عرفناها من الدخول (فتح الصفحة وهو لسا ما غيّر المؤقتة)
  const [askCurrent, setAskCurrent] = useState(forceChange)
  const [code, setCode] = useState('')
  const [error, setError] = useState(notice)
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  function go(next) {
    setMode(next)
    setError('')
    setInfo('')
    setPassword('')
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') {
        const result = await login(email.trim(), password)
        if (!result.user?.roles?.includes('Admin')) {
          signOut()
          throw Object.assign(new Error(), { status: 403 })
        }
        if (result.mustChangePassword) {
          setCurrent(password)
          setAskCurrent(false)
          setPassword('')
          setMode('change')
          setInfo('دخلت بكلمة مرور مؤقتة، اختر كلمة مرور جديدة للمتابعة')
          setBusy(false)
          return
        }
        onSignedIn(result.user)
        return
      }
      if (mode === 'change') {
        if (password !== confirm) throw Object.assign(new Error(), { code: 'Mismatch' })
        const result = await changePassword(current, password)
        onSignedIn(result.user)
        return
      }
      if (mode === 'forgot') {
        await forgotPassword(email.trim())
        setMode('reset')
        setPassword('')
        setInfo('إذا كان البريد مسجّلاً، وصلك رمز من 6 أرقام (صالح 10 دقائق)')
      } else {
        await resetPassword(email.trim(), code.trim(), password)
        go('login')
        setInfo('تم تغيير كلمة المرور، سجّل الدخول')
      }
    } catch (err) {
      if (err.code === 'Mismatch') setError('كلمتا المرور غير متطابقتين')
      else if (mode === 'change' && err.code === 'Auth.InvalidCredentials') setError('كلمة المرور الحالية غير صحيحة')
      else setError(errorText(err))
    }
    setBusy(false)
  }

  const titles = { login: 'لوحة تحكم لبيك', forgot: 'نسيت كلمة المرور', reset: 'كلمة مرور جديدة', change: 'تغيير كلمة المرور' }
  const buttons = { login: 'تسجيل الدخول', forgot: 'إرسال الرمز', reset: 'حفظ كلمة المرور', change: 'حفظ والمتابعة' }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand font-ar" dir="rtl">
      <form onSubmit={submit} className="flex w-[420px] flex-col gap-[16px] rounded-[16px] bg-white p-[36px] shadow-card">
        <img src="/logo.png" alt="" className="mx-auto h-[91px] w-[69px] object-contain" />
        <h1 className="m-0 text-center text-[26px] font-bold">{titles[mode]}</h1>

        {mode !== 'change' && (
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required readOnly={mode === 'reset'} placeholder="البريد الإلكتروني" dir="ltr" className={input} />
        )}
        {mode === 'change' && askCurrent && (
          <input value={current} onChange={(e) => setCurrent(e.target.value)} type="password" required placeholder="كلمة المرور الحالية (المؤقتة)" dir="ltr" className={input} />
        )}
        {mode === 'reset' && (
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required inputMode="numeric" placeholder="رمز التحقق (6 أرقام)" dir="ltr" className={input} />
        )}
        {mode !== 'forgot' && (
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={mode === 'reset' || mode === 'change' ? 8 : undefined}
            placeholder={mode === 'reset' || mode === 'change' ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
            dir="ltr"
            className={input}
          />
        )}
        {mode === 'change' && (
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required minLength={8} placeholder="تأكيد كلمة المرور الجديدة" dir="ltr" className={input} />
        )}
        {(mode === 'reset' || mode === 'change') && <p className="m-0 text-[12px] text-muted">8 أحرف على الأقل: حرف كبير وصغير ورقم ورمز</p>}

        {info && <p className="m-0 text-center text-[14px] text-okText">{info}</p>}
        {error && <p className="m-0 text-center text-[14px] text-danger">{error}</p>}

        <button disabled={busy} className="h-[52px] rounded-[10px] bg-brand text-[18px] font-semibold text-white disabled:opacity-60">
          {busy ? 'لحظة…' : buttons[mode]}
        </button>

        {mode === 'login' ? (
          <button type="button" onClick={() => go('forgot')} className="text-[14px] text-brand underline">
            نسيت كلمة المرور؟
          </button>
        ) : mode === 'change' ? (
          <button
            type="button"
            onClick={() => {
              signOut()
              setCurrent('')
              setConfirm('')
              setAskCurrent(false)
              go('login')
            }}
            className="text-[14px] text-muted"
          >
            تسجيل الخروج
          </button>
        ) : (
          <button type="button" onClick={() => go('login')} className="text-[14px] text-muted">
            رجوع لتسجيل الدخول
          </button>
        )}
      </form>
    </div>
  )
}
