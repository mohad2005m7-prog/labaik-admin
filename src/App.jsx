import { useCallback, useEffect, useMemo, useState } from 'react'
import { companies as fetchCompanies, isSignedIn, overview as fetchOverview, resumeCompany, signOut, stopCompany } from './api/admin'
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
    const out = () => setSignedIn(false)
    window.addEventListener('labaik:signed-out', out)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('labaik:signed-out', out)
    }
  }, [signedIn, load])

  const shown = useMemo(() => {
    const q = query.trim()
    return list.filter((c) => (tab === 'all' || c.status === tab) && (!q || c.name?.includes(q)))
  }, [list, query, tab])

  async function toggle(company, on) {
    setBusyId(company.id)
    try {
      await (on ? resumeCompany(company.id) : stopCompany(company.id))
      await load()
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusyId(null)
    }
  }

  if (!signedIn) return <Login onSignedIn={() => setSignedIn(true)} />

  const user = tokens.get()?.user
  return (
    <>
    <Scaler>
      <main dir="rtl" className="absolute inset-0">
        <TopBar query={query} onQuery={setQuery} onAdd={() => setAdding(true)} />
        <StatCards data={stats} />
        <CompaniesPanel companies={shown} tab={tab} onTab={setTab} loading={loading} error={error} onRetry={load} onOpen={(c) => setOpenId(c.id)} onToggle={toggle} busyId={busyId} />
        <Sidebar
          active={nav}
          onSelect={setNav}
          ownerName={user?.fullName}
          onSignOut={() => {
            signOut()
            setSignedIn(false)
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
