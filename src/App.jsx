import { useCallback, useEffect, useMemo, useState } from 'react'
import { CompanyStatus, companies as fetchCompanies, isSignedIn, mustChangePassword, overview as fetchOverview, resumeCompany, signOut, stopCompany } from './api/admin'
import { errorText, tokens } from './api/client'
import AddCompanyDialog from './components/add/AddCompanyDialog'
import CompanyDialog from './components/company/CompanyDialog'
import CompaniesPanel from './components/dashboard/CompaniesPanel'
import Sidebar from './components/dashboard/Sidebar'
import StatCards from './components/dashboard/StatCards'
import TopBar from './components/dashboard/TopBar'
import Login from './components/Login'
import Scaler from './components/Scaler'

// -------------------------------------------------------------
// لوحة المالك (Figma «الداشبورد» 830:4308 — 1440×1024):
//   البيانات من الخادم: GET /admin/overview + GET /admin/companies
//   المفتاح بالصف = إيقاف / تفعيل (POST .../stop · .../resume) — العين = تفاصيل الشركة
// -------------------------------------------------------------
export default function App() {
  const [signedIn, setSignedIn] = useState(isSignedIn)
  const [nav, setNav] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // خطأ الإيقاف / التفعيل — شريط لحاله والجدول بيضل ظاهر
  const [toggleError, setToggleError] = useState('')
  // سبب الخروج (حساب موقوف / لازم يغيّر كلمة المرور) — بينعرض بشاشة الدخول
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [busyId, setBusyId] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [adding, setAdding] = useState(false)

  const load = useCallback(
    () =>
      Promise.all([fetchOverview(), fetchCompanies()])
        .then(([o, c]) => {
          setError('')
          setStats(o)
          setList(c ?? [])
        })
        .catch((e) => setError(errorText(e)))
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    if (!signedIn) return
    const timer = setTimeout(load, 0)
    // بعد الخروج ما بدنا النوافذ ترجع تفتح لما يدخل من جديد
    const out = (e) => {
      setNotice(e.detail?.code ? errorText(e.detail) : '')
      setSignedIn(false)
      setOpenId(null)
      setAdding(false)
      setToggleError('')
    }
    window.addEventListener('labaik:signed-out', out)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('labaik:signed-out', out)
    }
  }, [signedIn, load])

  const shown = useMemo(() => {
    // toLowerCase للأسماء اللاتينية (العربي ما بيتأثر)
    const q = query.trim().toLowerCase()
    return list.filter((c) => (tab === 'all' || c.status === tab) && (!q || c.name?.toLowerCase().includes(q)))
  }, [list, query, tab])

  async function toggle(company, on) {
    setBusyId(company.id)
    setToggleError('')
    try {
      const updated = await (on ? resumeCompany(company.id) : stopCompany(company.id))
      // الصف بيتحدّث فوراً من رد الخادم (AdminCompanyDto — التفعيل ممكن يرجّع «منتهي») والأرقام فوق بالخلفية
      setList((l) =>
        l.map((c) =>
          c.id === company.id ? { ...c, status: updated?.status ?? (on ? CompanyStatus.Active : CompanyStatus.Stopped), daysRemaining: updated?.daysRemaining ?? c.daysRemaining } : c,
        ),
      )
      fetchOverview()
        .then(setStats)
        .catch(() => {})
    } catch (e) {
      setToggleError(errorText(e))
    } finally {
      setBusyId(null)
    }
  }

  if (!signedIn)
    return (
      <Login
        forceChange={mustChangePassword()}
        notice={notice}
        onSignedIn={() => {
          setNotice('')
          setSignedIn(true)
        }}
      />
    )

  const user = tokens.get()?.user
  return (
    <>
    <Scaler>
      <main dir="rtl" className="absolute inset-0">
        <TopBar query={query} onQuery={setQuery} onAdd={() => setAdding(true)} />
        <StatCards data={stats} />
        <CompaniesPanel companies={shown} tab={tab} onTab={setTab} loading={loading} error={error} onRetry={load} onOpen={(c) => setOpenId(c.id)} onToggle={toggle} busyId={busyId} toggleError={toggleError} onDismissToggleError={() => setToggleError('')} />
        <Sidebar
          active={nav}
          onSelect={setNav}
          ownerName={user?.fullName}
          onSignOut={() => {
            signOut()
            window.dispatchEvent(new Event('labaik:signed-out'))
          }}
        />
      </main>
    </Scaler>

      {openId && (
        <CompanyDialog
          id={openId}
          onClose={() => setOpenId(null)}
          onSaved={() => {
            setOpenId(null)
            load()
          }}
        />
      )}
      {adding && (
        <AddCompanyDialog
          onClose={() => setAdding(false)}
          onCreated={() => {
            setAdding(false)
            load()
          }}
        />
      )}
    </>
  )
}
