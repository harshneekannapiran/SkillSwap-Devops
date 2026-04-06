import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { apiClient } from '../../services/apiClient.js'

const navLinkBase =
  'text-sm font-medium text-text-secondary px-3 py-1 transition-colors hover:text-primary'

export function Navbar() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [user, setUser] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('skillswap_token')
      const userData = localStorage.getItem('skillswap_user')
      console.log('Navbar auth check:', { token: !!token, user: !!userData })
      setIsAuthed(!!token)
      setUser(userData ? JSON.parse(userData) : null)
    }

    const fetchUnreadMessages = async () => {
      if (!isAuthed) return
      
      try {
        const response = await apiClient.get('/api/chat/conversations')
        const conversations = response.data || []
        
        // Count conversations with unread messages (simplified for now)
        const unreadCount = conversations.filter(conv => {
          // This is a simplified count - in a real app, you'd track actual read/unread status
          return conv.last_message && conv.last_message.includes('new')
        }).length
        
        setUnreadCount(unreadCount)
      } catch (error) {
        console.error('Failed to fetch unread messages:', error)
        setUnreadCount(0)
      }
    }

    checkAuth()
    fetchUnreadMessages()

    const handleStorage = (e) => {
      console.log('Storage event:', e)
      checkAuth()
      fetchUnreadMessages()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', checkAuth)
    
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', checkAuth)
    }
  }, [isAuthed])

  const handleLogout = () => {
    localStorage.removeItem('skillswap_token')
    localStorage.removeItem('skillswap_user')
    setIsAuthed(false)
    setUser(null)
    navigate('/', { replace: true })
  }

  // Don't show navbar on home page or auth page
  const hideNavbar = location.pathname === '/' || location.pathname === '/auth'

  if (hideNavbar) {
    return null
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur navbar-dark">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Left - SkillSwap Logo */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white text-base font-semibold shadow-sm"
          >
            S
          </Link>
          <span className="text-sm font-semibold text-text-primary">
            SkillSwap
          </span>
        </div>

        {/* Center - Navigation Links */}
        <nav className="hidden flex items-center justify-center gap-2 md:flex">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'text-primary' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/skills"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'text-primary' : ''}`
            }
          >
            Skills
          </NavLink>
          <NavLink
            to="/mentorship"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'text-primary' : ''}`
            }
          >
            Mentorship
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'text-primary' : ''} font-medium relative`
            }
          >
            Chat
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'text-primary' : ''}`
            }
          >
            Profile
          </NavLink>
          {user?.role === 'student' ? (
            <NavLink
              to="/my-applications"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? 'text-primary' : ''}`
              }
            >
              My Applications
            </NavLink>
          ) : user?.role === 'alumni' ? (
            <NavLink
              to="/view-applicants"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? 'text-primary' : ''}`
              }
            >
              Applicants
            </NavLink>
          ) : null}
          <NavLink
            to="/opportunities"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'text-primary' : ''}`
            }
          >
            Opportunities
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'text-primary' : ''}`
            }
          >
            Events
          </NavLink>
          <NavLink
            to="/forum"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'text-primary' : ''}`
            }
          >
            Forum
          </NavLink>
        </nav>

        {/* Right - Theme Toggle and Profile */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-border bg-card text-text-secondary hover:text-primary hover:border-primary transition-colors"
                title="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.591a.75.75 0 101.06 1.06l1.591-1.591zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.591-1.591a.75.75 0 10-1.06 1.06l1.591 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.591a.75.75 0 001.06 1.06l1.591-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06L6.166 5.106a.75.75 0 00-1.06 1.06l1.591 1.591z"/>
                  </svg>
                )}
              </button>

              {/* User Avatar */}
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-primary hover:border-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center">
                    {getInitials(user.name)}
                  </div>
                  <span className="hidden sm:block">{user.name}</span>
                </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card shadow-lg p-4 z-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white text-lg font-semibold flex items-center justify-center">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{user.name}</p>
                      <p className="text-sm text-text-secondary capitalize">{user.role}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-3 space-y-2">
                    <Link
                      to="/profile"
                      className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-background rounded-lg transition-colors"
                      onClick={() => setShowProfile(false)}
                    >
                      View Profile
                    </Link>
                    {user?.role === 'student' ? (
                      <Link
                        to="/my-mentor"
                        className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-background rounded-lg transition-colors"
                        onClick={() => setShowProfile(false)}
                      >
                        My Mentor
                      </Link>
                    ) : user?.role === 'alumni' ? (
                      <Link
                        to="/my-students"
                        className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-background rounded-lg transition-colors"
                        onClick={() => setShowProfile(false)}
                      >
                        My Students
                      </Link>
                    ) : null}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
