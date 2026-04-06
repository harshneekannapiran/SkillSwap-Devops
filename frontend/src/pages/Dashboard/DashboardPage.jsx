import { StudentDashboard } from './StudentDashboard.jsx'
import { AlumniDashboard } from './AlumniDashboard.jsx'

export function DashboardPage() {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('skillswap_user') : null
  const user = userRaw ? JSON.parse(userRaw) : null

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Please log in to view your dashboard.</p>
      </div>
    )
  }

  // Render role-specific dashboard
  if (user.role === 'student') {
    return <StudentDashboard />
  } else if (user.role === 'alumni') {
    return <AlumniDashboard />
  } else {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Invalid user role. Please contact support.</p>
      </div>
    )
  }
}

