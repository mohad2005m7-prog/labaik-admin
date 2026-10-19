import { useState } from 'react'
import { login } from '../api/admin'
import { errorText } from '../api/client'

// تسجيل دخول المالك — ⚠️ مش موجودة بـ Figma: مبنية بنفس ألوان وخطوط اللوحة لحد ما تنصمّم
// الدخول بحساب دوره Admin (من إعدادات الخادم Admin:Emails)
export default function Login({ onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await login(email.trim(), password)
      if (!result?.user?.roles?.includes('Admin')) throw Object.assign(new Error(), { status: 403 })
      onSignedIn(result.user)
    } catch (err) {
      setError(errorText(err))
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand font-ar" dir="rtl">
      <form onSubmit={submit} className="flex w-[420px] flex-col gap-[16px] rounded-[16px] bg-white p-[36px] shadow-card">
        <img src="/logo.png" alt="" className="mx-auto h-[91px] w-[69px] object-contain" />
        <h1 className="m-0 text-center text-[26px] font-bold">لوحة تحكم لبيك</h1>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="البريد الإلكتروني" dir="ltr" className="h-[52px] rounded-[10px] border border-line px-[16px] text-right text-[16px] outline-none focus:border-brand" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="كلمة المرور" dir="ltr" className="h-[52px] rounded-[10px] border border-line px-[16px] text-right text-[16px] outline-none focus:border-brand" />
        {error && <p className="m-0 text-center text-[14px] text-danger">{error}</p>}
        <button disabled={busy} className="h-[52px] rounded-[10px] bg-brand text-[18px] font-semibold text-white disabled:opacity-60">
          {busy ? 'جارٍ الدخول…' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  )
}
