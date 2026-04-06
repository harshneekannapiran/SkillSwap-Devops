import { StudentOpportunitiesPage } from './StudentOpportunitiesPage.jsx'
import { AlumniOpportunitiesPage } from './AlumniOpportunitiesPage.jsx'

export function OpportunitiesPage() {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('skillswap_user') : null
  const user = userRaw ? JSON.parse(userRaw) : null

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Please log in to view opportunities.</p>
      </div>
    )
  }

  // Render role-specific opportunities page
  if (user.role === 'student') {
    return <StudentOpportunitiesPage />
  } else if (user.role === 'alumni') {
    return <AlumniOpportunitiesPage />
  } else {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Invalid user role. Please contact support.</p>
      </div>
    )
  }
}
