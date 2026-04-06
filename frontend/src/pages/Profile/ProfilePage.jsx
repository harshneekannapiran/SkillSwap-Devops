import { StudentProfilePage } from './StudentProfilePage.jsx'
import { AlumniProfilePage } from './AlumniProfilePage.jsx'

export function ProfilePage() {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('skillswap_user') : null
  const user = userRaw ? JSON.parse(userRaw) : null

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Profile Not Found</h2>
          <p className="text-text-secondary mb-6">Unable to load your profile. Please try logging in again.</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Render role-specific profile page
  if (user.role === 'student') {
    return <StudentProfilePage />
  } else if (user.role === 'alumni') {
    return <AlumniProfilePage />
  } else {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Invalid user role. Please contact support.</p>
      </div>
    )
  }
}
