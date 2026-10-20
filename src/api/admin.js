import { api, ApiError, tokens } from './client'

// -------------------------------------------------------------
// لوحة المالك — مسارات /admin (للـ Admin بس) + الدخول
// الأرقام كلها أعداد صحيحة (enums):
//   CompanyStatus: 1 مفعّل · 2 متوقّف · 3 منتهي (السيرفر بيحسبها)
//   CompanyCategory: 1 عمرة · 2 حج · 3 حج وعمرة
//   SubscriptionPeriod: 4 سنة (اشتراكاتنا سنوية بس حالياً)
// -------------------------------------------------------------
export const CompanyStatus = { Active: 1, Stopped: 2, Expired: 3 }
export const Category = { Umrah: 1, Hajj: 2, HajjAndUmrah: 3 }
export const YEARLY = 4

export const SERVICES = [
  ['gpsTracking', 'تتبع المعتمرين (GPS)'],
  ['duaAndRituals', 'الأدعية والمناسك'],
  ['instantNotifications', 'الإشعارات الفورية'],
  ['chatWithGuides', 'الدردشة مع المرشدين'],
  ['reportsAndStats', 'التقارير والإحصاءات'],
]

export async function login(email, password) {
  const result = await api('/auth/login', { method: 'POST', body: { email, password }, auth: false })
  if (!result?.accessToken) throw new ApiError(502, 'NotConnected')
  tokens.set(result)
  return result
}

/** نسيت كلمة المرور: رمز من 6 أرقام بيوصل للإيميل (صالح 10 دقائق) */
export const forgotPassword = (email) => api('/auth/forgot-password', { method: 'POST', body: { email }, auth: false })

export const resetPassword = (email, code, newPassword) => api('/auth/reset-password', { method: 'POST', body: { email, code, newPassword }, auth: false })

export const signOut = () => tokens.set(null)
export const isSignedIn = () => Boolean(tokens.get()?.accessToken)

/** AdminOverviewDto { pendingRequests, activeSubscriptions, subscriptionsExpiringIn30Days, activePilgrims, activeCompanies, totalCompanies } */
export const overview = () => api('/admin/overview')

/** AdminCompanyListItemDto[] { id, name, logoUrl?, activePilgrims, subscriptionStartUtc?, subscriptionEndUtc?, status, daysRemaining? } */
export const companies = () => api('/admin/companies')

/** AdminCompanyDto (كل حقول النموذج + enabledServices, isStopped, status, daysRemaining, stats) */
export const company = (id) => api(`/admin/companies/${encodeURIComponent(id)}`)

export const createCompany = (command) => api('/admin/companies', { method: 'POST', body: command })

export const updateCompany = (id, request) => api(`/admin/companies/${encodeURIComponent(id)}`, { method: 'PUT', body: request })

export const stopCompany = (id) => api(`/admin/companies/${encodeURIComponent(id)}/stop`, { method: 'POST' })

export const resumeCompany = (id) => api(`/admin/companies/${encodeURIComponent(id)}/resume`, { method: 'POST' })

/** كلمة مرور مؤقتة جديدة لمالك الشركة — ⚠️ لسا مش موجودة على السيرفر (docs/ibrahim_pending_2026-10-19.md بند 7) */
export const issueTempPassword = (id) => api(`/admin/companies/${encodeURIComponent(id)}/temp-password`, { method: 'POST' })

/** UpdateCompanyRequest = نفس النموذج بدون ownerEmail (استبدال كامل) — من AdminCompanyDto */
export function toUpdateRequest(dto, changes = {}) {
  const keys = [
    'name', 'commercialRegistrationNumber', 'contactFullName', 'category', 'officialEmail', 'primaryPhone', 'logoUrl',
    'country', 'city', 'vatId', 'contractReferenceNumber', 'subscriptionPrice', 'subscriptionPeriod', 'contractStartDate',
    'contractEndDate', 'maxSupervisors', 'maxPilgrims', 'contractFileUrl', 'contactJobTitle', 'contactMobile', 'enabledServices',
  ]
  const request = {}
  for (const k of keys) request[k] = dto[k] ?? null
  return { ...request, ...changes }
}
