import { StudentEventsPage } from './StudentEventsPage.jsx'
import { AlumniEventsPage } from './AlumniEventsPage.jsx'

export function EventsPage() {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('skillswap_user') : null
  const user = userRaw ? JSON.parse(userRaw) : null

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Please log in to view events.</p>
      </div>
    )
  }

  // Render role-specific events page
  if (user.role === 'student') {
    return <StudentEventsPage />
  } else if (user.role === 'alumni') {
    return <AlumniEventsPage />
  } else {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Invalid user role. Please contact support.</p>
      </div>
    )
  }
}
