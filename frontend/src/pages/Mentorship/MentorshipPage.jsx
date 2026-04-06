import { StudentMentorshipPage } from './StudentMentorshipPage.jsx'
import { AlumniMentorshipPage } from './AlumniMentorshipPage.jsx'

export function MentorshipPage() {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('skillswap_user') : null
  const user = userRaw ? JSON.parse(userRaw) : null

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Please log in to view mentorship.</p>
      </div>
    )
  }

  // Render role-specific mentorship page
  if (user.role === 'student') {
    return <StudentMentorshipPage />
  } else if (user.role === 'alumni') {
    return <AlumniMentorshipPage />
  } else {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Invalid user role. Please contact support.</p>
      </div>
    )
  }
}

