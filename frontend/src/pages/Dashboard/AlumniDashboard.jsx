import { useState, useEffect } from 'react'
import { DashboardCard } from '../../components/common/DashboardCard.jsx'
import { apiClient } from '../../services/apiClient.js'

export function AlumniDashboard() {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('skillswap_user') : null
  const user = userRaw ? JSON.parse(userRaw) : null
  const [stats, setStats] = useState({
    mentorshipRequests: 0,
    studentsMentored: 0,
    upcomingSessions: 0,
    skillsOffered: 0,
    opportunitiesPosted: 0,
    eventsCreated: 0
  })
  const [loading, setLoading] = useState(true)
  const [mentorshipRequests, setMentorshipRequests] = useState([])
  const [skillsOffered, setSkillsOffered] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    const fetchAlumniData = async () => {
      try {
        const token = localStorage.getItem('skillswap_token')
        if (!token) return

        // Fetch mentorship requests
        const mentorshipRes = await apiClient.get('/api/mentorship/requests')
        const requests = mentorshipRes.data.received || []
        const pendingRequests = requests.filter(r => r.status === 'pending').length || 0
        const acceptedRequests = requests.filter(r => r.status === 'accepted').length || 0

        // Fetch skills offered
        const skillsRes = await apiClient.get('/api/skills/mine')
        const skills = skillsRes.data || []

        // Fetch opportunities posted
        const jobsRes = await apiClient.get('/api/jobs/mine')
        const jobs = jobsRes.data || []

        // Fetch events created
        const eventsRes = await apiClient.get('/api/events/mine')
        const userEvents = eventsRes.data || []

        setStats({
          mentorshipRequests: pendingRequests,
          studentsMentored: acceptedRequests,
          upcomingSessions: acceptedRequests,
          skillsOffered: skills.length,
          opportunitiesPosted: jobs.length,
          eventsCreated: userEvents.length
        })

        setMentorshipRequests(requests.slice(0, 5))
        setSkillsOffered(skills)
        setOpportunities(jobs)
        setEvents(userEvents)
      } catch (error) {
        console.error('Failed to fetch alumni dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlumniData()
  }, [])

  const handleAcceptRequest = async (requestId) => {
    try {
      await apiClient.put(`/api/mentorship/requests/${requestId}/accept`)
      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error('Failed to accept request:', error)
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await apiClient.put(`/api/mentorship/requests/${requestId}/reject`)
      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleDeleteOpportunity = async (jobId) => {
    try {
      await apiClient.delete(`/api/jobs/${jobId}`)
      alert('Opportunity deleted successfully!')
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete opportunity:', error)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      await apiClient.delete(`/api/events/${eventId}`)
      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event')
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

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Alumni Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-text-primary">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-2 text-base text-gray-600 max-w-xl">
            Mentor students, share your expertise, and help shape the next generation.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
        <DashboardCard
          label="Mentorship Requests"
          value={loading ? '...' : stats.mentorshipRequests}
          description="Requests from students"
        />
        <DashboardCard
          label="Students Mentored"
          value={loading ? '...' : stats.studentsMentored}
          description="Active mentorships"
        />
        <DashboardCard
          label="Upcoming Sessions"
          value={loading ? '...' : stats.upcomingSessions}
          description="Scheduled sessions"
        />
        <DashboardCard
          label="Skills Offered"
          value={loading ? '...' : stats.skillsOffered}
          description="Skills you can teach"
        />
        <DashboardCard
          label="Opportunities Posted"
          value={loading ? '...' : stats.opportunitiesPosted}
          description="Jobs and internships"
        />
        <DashboardCard
          label="Events Created"
          value={loading ? '...' : stats.eventsCreated}
          description="Events you have hosted"
        />
      </div>

      {/* Mentorship Requests */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Mentorship Requests</h2>
        <div className="space-y-4">
          {mentorshipRequests.map(request => (
            <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    {request.student_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{request.student_name}</p>
                    <p className="text-sm text-text-secondary">{request.topic}</p>
                  </div>
                </div>
                <p className="text-text-secondary text-sm">{request.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-3 py-1 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Offered */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Skills You Offer</h2>
        <div className="space-y-4">
          {skillsOffered.map(skill => (
            <div key={skill.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-text-primary">{skill.name}</p>
                <p className="text-sm text-text-secondary">{skill.category}</p>
              </div>
              <button
                onClick={() => handleDeleteSkill(skill.id)}
                className="px-3 py-1 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities Posted */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Opportunities Posted</h2>
        <div className="space-y-4">
          {opportunities.map(opportunity => (
            <div key={opportunity.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-text-primary">{opportunity.title}</p>
                <p className="text-sm text-text-secondary">{opportunity.company}</p>
                <p className="text-sm text-text-secondary">{opportunity.location}</p>
              </div>
              <button
                onClick={() => handleDeleteOpportunity(opportunity.id)}
                className="px-3 py-1 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Events Created */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Events Created</h2>
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-text-primary">{event.title}</p>
                <p className="text-sm text-text-secondary">{new Date(event.event_time).toLocaleDateString()}</p>
                <p className="text-sm text-text-secondary">{event.location}</p>
              </div>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="px-3 py-1 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
