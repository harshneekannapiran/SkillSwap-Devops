import { Outlet } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar.jsx'
import { useLocation } from 'react-router-dom'

function App() {
  const location = useLocation()
  
  // Home and auth pages should be full screen without navbar
  const isFullPage = location.pathname === '/' || location.pathname === '/auth'

  if (isFullPage) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-border bg-card py-4">
        <div className="text-center text-xs text-text-secondary">
          © {new Date().getFullYear()} SkillSwap. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default App
