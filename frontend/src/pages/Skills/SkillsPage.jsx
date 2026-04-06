import { StudentSkillsPage } from './StudentSkillsPage.jsx'
import { AlumniSkillsPage } from './AlumniSkillsPage.jsx'

export function SkillsPage() {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('skillswap_user') : null
  const user = userRaw ? JSON.parse(userRaw) : null

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Please log in to view skills.</p>
      </div>
    )
  }

  // Render role-specific skills page
  if (user.role === 'student') {
    return <StudentSkillsPage />
  } else if (user.role === 'alumni') {
    return <AlumniSkillsPage />
  } else {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Invalid user role. Please contact support.</p>
      </div>
    )
  }
}
