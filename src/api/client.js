// -------------------------------------------------------------
// طلبات سيرفر لبيك (ASP.NET Core) — حسب flutter_handoff_2026-10-18 و /openapi/v1.json
//   - الأساس /api/v1 (بالتطوير بيمرّ عبر proxy تبع Vite)
//   - accessToken صالح 15 دقيقة، و refreshToken لمرة وحدة (كل تجديد بيرجع زوج جديد)
//   - الأخطاء ProblemDetails: { status, title, code } (و errors لـ 422) — بنعرض الرسالة حسب code
// -------------------------------------------------------------
const BASE = import.meta.env.VITE_API_BASE ?? '/api/v1'
const KEY = 'labaik_admin_tokens'

export class ApiError extends Error {
  constructor(status, code, title, errors) {
    super(title || `HTTP ${status}`)
    this.status = status
    this.code = code
    // 422: قاموس { حقل: [رسائل] } من الخادم
    this.errors = errors
  }
}

// الذاكرة احتياط بس لو التخزين مسكّر — غير هيك دايماً بنقرأ localStorage (تاب تاني ممكن يكون جدّد أو طلع)
let memory = null
let stored = true

export const tokens = {
  get() {
    if (!stored) return memory
    try {
      return JSON.parse(localStorage.getItem(KEY)) ?? null
    } catch {
      return memory
    }
  },
  set(value) {
    memory = value
    try {
      if (value) localStorage.setItem(KEY, JSON.stringify(value))
      else localStorage.removeItem(KEY)
      stored = true
    } catch {
      // التخزين مسكّر (تصفح خاص) — الجلسة بتضل بالذاكرة لحد ما تسكّر الصفحة
      stored = false
    }
  },
}

// طلع من تاب تاني → بنطلّعه هون كمان (التجديد بتاب تاني بنقرأه لحاله من التخزين)
window.addEventListener('storage', (e) => {
  if ((e.key === KEY || e.key === null) && !tokens.get()?.accessToken) window.dispatchEvent(new Event('labaik:signed-out'))
})

let refreshing = null

async function refresh() {
  const current = tokens.get()
  if (!current?.refreshToken) return false
  refreshing ??= fetch(`${BASE}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  })
    .then(async (r) => {
      if (r.ok) {
        tokens.set(await r.json())
        return true
      }
      // الـ refreshToken لمرة وحدة: لو تاب تاني سبقنا وجدّد، بنكمّل بالزوج الجديد اللي خزّنه
      const now = tokens.get()?.refreshToken
      return Boolean(now && now !== current.refreshToken)
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

async function readProblem(res) {
  if (!(res.headers.get('content-type') ?? '').includes('json')) return {}
  try {
    return (await res.json()) ?? {}
  } catch {
    // جسم فاضي
    return {}
  }
}

/** نهاية الجلسة: بنمسح التوكنات وبنبلّغ App (detail.code = السبب لرسالة شاشة الدخول) */
function endSession(code) {
  const current = tokens.get()
  // لازم يغيّر كلمة المرور: بنخلي التوكن عشان شاشة «تغيير كلمة المرور» تكمّل فيه
  if (code === 'Auth.PasswordChangeRequired' && current?.accessToken) tokens.set({ ...current, mustChangePassword: true })
  else tokens.set(null)
  window.dispatchEvent(new CustomEvent('labaik:signed-out', { detail: { code } }))
}

/**
 * رد مش ok لطلب بتوكن:
 *   401 بلا code (أو Auth.Required) = التوكن انتهى → بنجدد ونعيد مرة وحدة ([again])، وإذا ما زبط بنطلّعه
 *   401 فيها code (زي Auth.InvalidCredentials لكلمة المرور الحالية الغلط) = خطأ عادي، ما بنجدد
 *   403 الحساب موقوف / لازم يغيّر كلمة المرور → بنطلّعه؛ أي 403 تاني خطأ عادي (التجديد ما بيفيد)
 */
async function fail(res, retry, again) {
  const problem = await readProblem(res)
  if (res.status === 401 && (!problem.code || problem.code === 'Auth.Required')) {
    if (retry && (await refresh())) return again()
    endSession()
  } else if (res.status === 403 && (problem.code === 'Auth.AccountDisabled' || problem.code === 'Auth.PasswordChangeRequired')) {
    endSession(problem.code)
  }
  throw new ApiError(res.status, problem.code, problem.title, problem.errors)
}

/** طلب JSON — عند 401 بنجدد التوكن ونعيد مرة وحدة (شوف fail) */
export async function api(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const current = tokens.get()
  if (auth && current?.accessToken) headers.Authorization = `Bearer ${current.accessToken}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError(0, 'Network', 'offline')
  }

  if (!res.ok) {
    if (auth) return fail(res, retry, () => api(path, { method, body, auth, retry: false }))
    const problem = await readProblem(res)
    throw new ApiError(res.status, problem.code, problem.title, problem.errors)
  }
  if (res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  // رد HTML بدل JSON = الطلب ما وصل لسيرفر لبيك (إعداد Rewrite ناقص على الاستضافة)
  if (!(res.headers.get('content-type') ?? '').includes('json')) throw new ApiError(502, 'NotConnected', 'not json')
  return JSON.parse(text)
}

/** رفع ملف (multipart) — POST /files → { url } (صورة jpg/png/webp لحد 5MB، PDF لحد 10MB) */
export async function upload(file, retry = true) {
  const current = tokens.get()
  const body = new FormData()
  body.append('file', file)
  let res
  try {
    res = await fetch(`${BASE}/files`, { method: 'POST', headers: current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {}, body })
  } catch {
    throw new ApiError(0, 'Network', 'offline')
  }
  if (!res.ok) return fail(res, retry, () => upload(file, false))
  if (!(res.headers.get('content-type') ?? '').includes('json')) throw new ApiError(502, 'NotConnected', 'not json')
  const result = await res.json()
  if (!result?.url) throw new ApiError(502, 'NotConnected')
  return result.url
}

/** رسالة عربية للخطأ — حسب code ثم status */
export function errorText(error) {
  const byCode = {
    'Auth.InvalidCredentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Auth.EmailNotConfirmed': 'الحساب غير مؤكد',
    'Company.RegistrationNumberTaken': 'رقم السجل التجاري مستخدم لشركة أخرى',
    'Company.OwnerAlreadyHasCompany': 'هذا البريد مرتبط بشركة أخرى',
    'Company.ContractEndBeforeStart': 'تاريخ الانتهاء قبل تاريخ البدء',
    'Company.NotFound': 'الشركة غير موجودة',
    Network: 'تعذّر الاتصال بالخادم، حاول مرة أخرى',
    NotConnected: 'لوحة التحكم غير متصلة بالخادم (إعداد Rewrite على الاستضافة)',
    'Otp.Invalid': 'رمز التحقق غير صحيح',
    'Otp.Expired': 'انتهت صلاحية الرمز، اطلب رمزاً جديداً',
    'Otp.TooManyAttempts': 'محاولات كثيرة، اطلب رمزاً جديداً',
    'Otp.Throttled': 'انتظر قليلاً قبل طلب رمز جديد',
    'Auth.ResetFailed': 'تعذّر تغيير كلمة المرور، تحقق من الرمز',
    'Company.HasActiveTrips': 'لدى الشركة رحلات جارية حالياً',
    'File.UnsupportedType': 'نوع الملف غير مدعوم (الشعار PNG أو JPG أو WEBP، والعقد PDF)',
    'File.TooLarge': 'حجم الملف كبير (الصورة حتى 5 ميجابايت، والـ PDF حتى 10)',
    'Auth.PasswordChangeRequired': 'يجب تغيير كلمة المرور المؤقتة أولاً',
    'Auth.AccountDisabled': 'هذا الحساب موقوف',
    'User.CreationFailed': 'تعذّر إنشاء حساب المالك، تحقق من البريد ومن كلمة المرور المؤقتة (8 أحرف على الأقل وفيها حرف كبير وصغير ورقم ورمز)',
    'Auth.ChangePasswordFailed': 'كلمة المرور الجديدة غير مقبولة: 8 أحرف على الأقل وفيها حرف كبير وصغير ورقم ورمز',
  }
  if (error?.code && byCode[error.code]) return byCode[error.code]
  if (error?.status === 403) return 'هذا الحساب لا يملك صلاحية لوحة التحكم'
  if (error?.status === 409) return 'لا يمكن تنفيذ العملية بحالة الشركة الحالية'
  if (error?.status === 422) {
    // أول رسالة من قاموس errors (بالإنجليزي من الخادم) عشان يعرف أي حقل
    const first = Object.values(error.errors ?? {}).flat()[0]
    return first ? `تحقق من الحقول المطلوبة (${first})` : 'تحقق من الحقول المطلوبة'
  }
  return 'حدث خطأ غير متوقع، حاول مرة أخرى'
}
