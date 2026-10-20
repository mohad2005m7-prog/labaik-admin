// -------------------------------------------------------------
// طلبات سيرفر لبيك (ASP.NET Core) — حسب flutter_handoff_2026-10-18 و /openapi/v1.json
//   - الأساس /api/v1 (بالتطوير بيمرّ عبر proxy تبع Vite)
//   - accessToken صالح 15 دقيقة، و refreshToken لمرة وحدة (كل تجديد بيرجع زوج جديد)
//   - الأخطاء ProblemDetails: { status, title, code } — بنعرض الرسالة حسب code
// -------------------------------------------------------------
const BASE = import.meta.env.VITE_API_BASE ?? '/api/v1'
const KEY = 'labaik_admin_tokens'

export class ApiError extends Error {
  constructor(status, code, title) {
    super(title || `HTTP ${status}`)
    this.status = status
    this.code = code
  }
}

export const tokens = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) ?? null
    } catch {
      return null
    }
  },
  set(value) {
    try {
      if (value) localStorage.setItem(KEY, JSON.stringify(value))
      else localStorage.removeItem(KEY)
    } catch {
      // التخزين مسكّر (تصفح خاص) — الجلسة بتضل بالذاكرة لحد ما تسكّر الصفحة
    }
    memory = value
  },
}

let memory = tokens.get()
let refreshing = null

async function refresh() {
  const current = memory ?? tokens.get()
  if (!current?.refreshToken) return false
  refreshing ??= fetch(`${BASE}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  })
    .then(async (r) => {
      if (!r.ok) return false
      tokens.set(await r.json())
      return true
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

/** طلب JSON — عند 401 أو 403 بنجدد التوكن ونعيد مرة وحدة (نفس التطبيق) */
export async function api(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const current = memory ?? tokens.get()
  if (auth && current?.accessToken) headers.Authorization = `Bearer ${current.accessToken}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError(0, 'Network', 'offline')
  }

  if (auth && retry && (res.status === 401 || res.status === 403) && (await refresh())) {
    return api(path, { method, body, auth, retry: false })
  }
  if (res.status === 401 && auth) {
    tokens.set(null)
    window.dispatchEvent(new Event('labaik:signed-out'))
  }
  if (!res.ok) {
    let problem = {}
    try {
      problem = await res.json()
    } catch {
      // جسم فاضي
    }
    throw new ApiError(res.status, problem.code, problem.title)
  }
  if (res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  // رد HTML بدل JSON = الطلب ما وصل لسيرفر لبيك (إعداد Rewrite ناقص على الاستضافة)
  if (!(res.headers.get('content-type') ?? '').includes('json')) throw new ApiError(502, 'NotConnected', 'not json')
  return JSON.parse(text)
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
    'Company.HasActiveTrips': 'لا يمكن حذف شركة لديها رحلات جارية',
  }
  if (error?.code && byCode[error.code]) return byCode[error.code]
  if (error?.status === 403) return 'هذا الحساب لا يملك صلاحية لوحة التحكم'
  if (error?.status === 409) return 'لا يمكن تنفيذ العملية بحالة الشركة الحالية'
  if (error?.status === 422) return 'تحقق من الحقول المطلوبة'
  return 'حدث خطأ غير متوقع، حاول مرة أخرى'
}
