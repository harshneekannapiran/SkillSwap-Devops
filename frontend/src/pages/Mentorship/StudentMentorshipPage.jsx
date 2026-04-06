import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function StudentMentorshipPage() {
  const [mentors, setMentors] = useState([])
  const [requestedMentorIds, setRequestedMentorIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [formData, setFormData] = useState({
    topic: '',
    message: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [mentorsRes, requestsRes] = await Promise.all([
        apiClient.get('/api/mentorship/mentors'),
        apiClient.get('/api/mentorship/requests')
      ])
      
      console.log('Mentors data:', mentorsRes.data)
      console.log('Requests data:', requestsRes.data)
      
      const requestedIds = requestsRes.data.sent?.map(req => req.mentor_id) || []
      console.log('Requested mentor IDs:', requestedIds)
      
      // Mark mentors with requested status
      const mentorsWithStatus = mentorsRes.data.map(mentor => ({
        ...mentor,
        isRequested: requestedIds.includes(mentor.id)
      }))
      
      console.log('Mentors with status:', mentorsWithStatus)
      
      setMentors(mentorsWithStatus)
      setRequestedMentorIds(requestedIds)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMentors = async () => {
    try {
      const response = await apiClient.get('/api/mentorship/mentors')
      setMentors(response.data)
    } catch (error) {
      console.error('Failed to fetch mentors:', error)
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await apiClient.get('/api/mentorship/requests')
      setRequestedMentorIds(response.data.sent?.map(req => req.mentor_id) || [])
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    }
  }

  const handleRequestMentorship = async (mentor) => {
    // Prevent requesting if already requested
    if (mentor.isRequested) {
      alert('You have already requested mentorship from this mentor! Check your "My Applications" page to track status.')
      return
    }
    
    // Double-check by looking at requested mentor IDs
    if (requestedMentorIds.includes(mentor.id)) {
      alert('You have already requested mentorship from this mentor! Check your "My Applications" page to track status.')
      return
    }
    
    setSelectedMentor(mentor)
    setShowRequestForm(true)
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    try {
      await apiClient.post('/api/mentorship/requests', {
        mentor_id: selectedMentor.id,
        topic: formData.topic,
        message: formData.message
      })
      setShowRequestForm(false)
      setFormData({ topic: '', message: '' })
      setSelectedMentor(null)
      
      // Refresh the full data to update mentor status
      await fetchData()
      
      alert('Mentorship request sent successfully!')
    } catch (error) {
      console.error('Failed to send request:', error)
      if (error.response?.status === 409) {
        alert('You have already requested mentorship from this mentor!')
      } else {
        alert('Failed to send mentorship request')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading mentors...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Find Mentors</h1>
        <p className="mt-2 text-text-secondary">Connect with experienced alumni for guidance and mentorship</p>
        <p className="mt-1 text-sm text-text-muted-foreground">
          Track your mentorship requests in the "My Applications" page
        </p>
      </div>

      {/* Available Mentors */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Available Mentors</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mentors.map(mentor => (
            <div key={mentor.id} className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg">
                  {mentor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{mentor.name}</h3>
                  <p className="text-sm text-text-secondary">{mentor.company}</p>
                  <p className="text-sm text-text-secondary">{mentor.headline}</p>
                </div>
              </div>
              
              {mentor.bio && (
                <p className="text-text-secondary mb-4">{mentor.bio}</p>
              )}
              
              {mentor.expertise && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-text-primary mb-2">Expertise:</p>
                  <p className="text-sm text-text-secondary">{mentor.expertise}</p>
                </div>
              )}
              
              {mentor.isRequested ? (
                <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg cursor-not-allowed opacity-75 text-center font-medium">
                  Requested
                </div>
              ) : (
                <button
                  onClick={() => handleRequestMentorship(mentor)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Request Mentorship
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Request Mentorship from {selectedMentor.name}
            </h2>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Topic</label>
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Career Guidance, Technical Skills"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Message</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Tell them what you'd like to learn..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestForm(false)
                    setSelectedMentor(null)
                    setFormData({ topic: '', message: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-background transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mentors.length === 0 && (
        <div className="text-center py-10">
          <p className="text-text-secondary">No mentors available at the moment.</p>
        </div>
      )}
    </div>
  )
}
