import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/apiClient'

const MyMentor = () => {
  const [mentorship, setMentorship] = useState(null)
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyMentor()
  }, [])

  const fetchMyMentor = async (retryCount = 0) => {
    try {
      setLoading(true)
      
      // Check authentication
      const token = localStorage.getItem('skillswap_token')
      const userData = localStorage.getItem('skillswap_user')
      const user = userData ? JSON.parse(userData) : null
      
      console.log('Authentication check:')
      console.log('  Token exists:', !!token)
      console.log('  Token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'None')
      console.log('  User data:', user)
      console.log('  User ID:', user?.id)
      console.log('  User role:', user?.role)
      
      if (!token) {
        console.error('No authentication token found')
        alert('Please log in to access this page')
        navigate('/auth')
        return
      }
      
      if (!user || user.role !== 'student') {
        console.error('User is not a student or user data missing')
        alert('This page is only available for students')
        navigate('/dashboard')
        return
      }
      
      console.log('Fetching mentor data...')
      const response = await apiClient.get('/api/mentorship/my-mentor')
      console.log('Mentor data received:', response.data)
      console.log('Setting mentorship state:', response.data.mentorship)
      console.log('Setting mentor state:', response.data.mentor)
      
      setMentorship(response.data.mentorship)
      setMentor(response.data.mentor)
      
      // Check state after setting
      setTimeout(() => {
        console.log('Mentor state after setting:', mentor)
        console.log('Mentorship state after setting:', mentorship)
      }, 100)
    } catch (error) {
      console.error('Failed to fetch mentor:', error)
      
      // Handle different types of errors
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.error('Network/CORS error detected')
        if (retryCount < 2) {
          console.log(`Retrying... (${retryCount + 1}/2)`)
          setTimeout(() => fetchMyMentor(retryCount + 1), 1000)
          return
        }
        alert('Unable to connect to the server. Please check if the backend is running and accessible.')
      } else if (error.response?.status === 404) {
        // This is expected if user has no mentor
        console.log('No mentor found (404)')
      } else if (error.response?.status === 401) {
        console.error('Authentication error')
        alert('Please log in again to access this page.')
        navigate('/auth')
      } else {
        console.error('Unexpected error:', error.response?.data || error.message)
        alert('Failed to fetch mentor information. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChat = () => {
    if (mentor) {
      navigate(`/chat?user=${mentor.id}`)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-text-secondary">Loading mentor information...</div>
      </div>
    )
  }

  if (!mentor) {
    console.log('DEBUG: Showing No Mentor Yet state')
    console.log('DEBUG: mentor value:', mentor)
    console.log('DEBUG: mentor type:', typeof mentor)
    console.log('DEBUG: mentorship value:', mentorship)
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">My Mentor</h1>
            <p className="text-text-secondary">View your mentor profile and connect with them</p>
          </div>

          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Mentor Yet</h3>
            <p className="text-text-secondary mb-6">
              You don't have an accepted mentorship request yet. 
              Find and connect with alumni mentors to get guidance.
            </p>
            <button
              onClick={() => navigate('/mentorship')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Find Mentors
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary mb-2">My Mentor</h1>
          <p className="text-text-secondary">Connect with your mentor and get guidance</p>
        </div>

        {/* Mentor Profile Card - Ultra Compact Version */}
        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm max-w-xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary to-indigo-600 p-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 text-white text-sm font-semibold flex items-center justify-center">
                  {mentor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{mentor.name}</h2>
                  <p className="text-primary-100 text-xs">{mentor.position} at {mentor.company}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium">{mentor.role === 'alumni' ? 'Alumni' : 'Mentor'}</div>
                <div className="text-primary-100 text-xs">Connected {formatDate(mentorship.created_at)}</div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Left Column - Basic Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-text-primary mb-1">About</h3>
                  <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">
                    {mentor.bio || 'No bio available'}
                  </p>
                </div>

                {mentor.experience && (
                  <div>
                    <h3 className="text-xs font-semibold text-text-primary mb-1">Experience</h3>
                    <p className="text-text-secondary text-xs line-clamp-1">
                      {mentor.experience}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-semibold text-text-primary mb-1">Contact</h3>
                  <p className="text-text-secondary text-xs">
                    <span className="font-medium">Email:</span> {mentor.email}
                  </p>
                </div>
              </div>

              {/* Right Column - Skills & Actions */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-text-primary mb-1">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {mentor.skills && mentor.skills.length > 0 ? (
                      mentor.skills.slice(0, 4).map((skill, index) => (
                        <span key={index} 
                              className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-text-secondary text-xs">No skills listed</p>
                    )}
                    {mentor.skills && mentor.skills.length > 4 && (
                      <span className="text-text-secondary text-xs">+{mentor.skills.length - 4}</span>
                    )}
                  </div>
                </div>

                {/* Mentorship Details */}
                <div>
                  <h3 className="text-xs font-semibold text-text-primary mb-1">Mentorship</h3>
                  <div className="bg-muted rounded p-2 space-y-1">
                    <p className="text-text-secondary text-xs">
                      <span className="font-medium">Topic:</span> {mentorship.topic}
                    </p>
                    <p className="text-text-secondary text-xs">
                      <span className="font-medium">Status:</span> 
                      <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                        {mentorship.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleChat}
                    className="flex-1 px-2 py-1.5 bg-primary text-white rounded text-xs hover:bg-indigo-600 transition-colors"
                  >
                    💬 Chat
                  </button>
                  <button
                    onClick={() => navigate('/mentorship')}
                    className="px-2 py-1.5 border border-border text-text-primary rounded text-xs hover:bg-muted transition-colors"
                  >
                    More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyMentor
