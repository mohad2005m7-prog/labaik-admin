import { useState } from 'react'
import { forgotPassword, login, resetPassword, signOut } from '../api/admin'
import { errorText } from '../api/client'

// تسجيل دخول المالك + نسيت كلمة المرور — ⚠️ مش موجودة بـ Figma: مبنية بنفس ألوان وخطوط اللوحة لحد ما تنصمّم
// الدخول بحساب دوره Admin (من إعدادات الخادم Admin:Emails)
// نسيت كلمة المرور: POST /auth/forgot-password ← رمز 6 أرقام بالإيميل ← POST /auth/reset-password
const input = 'h-[52px] rounded-[10px] border border-line px-[16px] text-right text-[16px] outline-none focus:border-brand'

export default function Login({ onSignedIn }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
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
      setError(errorText(err))
    }
    setBusy(false)
  }

  const titles = { login: 'لوحة تحكم لبيك', forgot: 'نسيت كلمة المرور', reset: 'كلمة مرور جديدة' }
  const buttons = { login: 'تسجيل الدخول', forgot: 'إرسال الرمز', reset: 'حفظ كلمة المرور' }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand font-ar" dir="rtl">
      <form onSubmit={submit} className="flex w-[420px] flex-col gap-[16px] rounded-[16px] bg-white p-[36px] shadow-card">
        <img src="/logo.png" alt="" className="mx-auto h-[91px] w-[69px] object-contain" />
        <h1 className="m-0 text-center text-[26px] font-bold">{titles[mode]}</h1>

        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required readOnly={mode === 'reset'} placeholder="البريد الإلكتروني" dir="ltr" className={input} />
        {mode === 'reset' && (
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required inputMode="numeric" placeholder="رمز التحقق (6 أرقام)" dir="ltr" className={input} />
        )}
        {mode !== 'forgot' && (
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={mode === 'reset' ? 8 : undefined}
            placeholder={mode === 'reset' ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
            dir="ltr"
            className={input}
          />
        )}
        {mode === 'reset' && <p className="m-0 text-[12px] text-muted">8 أحرف على الأقل: حرف كبير وصغير ورقم ورمز</p>}

        {info && <p className="m-0 text-center text-[14px] text-okText">{info}</p>}
        {error && <p className="m-0 text-center text-[14px] text-danger">{error}</p>}

        <button disabled={busy} className="h-[52px] rounded-[10px] bg-brand text-[18px] font-semibold text-white disabled:opacity-60">
          {busy ? 'لحظة…' : buttons[mode]}
        </button>

        {mode === 'login' ? (
          <button type="button" onClick={() => go('forgot')} className="text-[14px] text-brand underline">
            نسيت كلمة المرور؟
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
