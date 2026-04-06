import { StudentChatPage } from './StudentChatPage.jsx'
import { AlumniChatPage } from './AlumniChatPage.jsx'

export function ChatPage() {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('skillswap_user') : null
  const user = userRaw ? JSON.parse(userRaw) : null

  console.log('ChatPage: User data:', user)
  console.log('ChatPage: User role:', user?.role)

  if (!user) {
    console.log('ChatPage: No user found, showing login message')
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Please log in to view chat.</p>
      </div>
    )
  }

  // Render role-specific chat page
  if (user.role === 'student') {
    console.log('ChatPage: Rendering StudentChatPage')
    return <StudentChatPage />
  } else if (user.role === 'alumni') {
    console.log('ChatPage: Rendering AlumniChatPage')
    return <AlumniChatPage />
  } else {
    console.log('ChatPage: Invalid user role:', user.role)
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Invalid user role: {user.role}. Please contact support.</p>
      </div>
    )
  }
}

