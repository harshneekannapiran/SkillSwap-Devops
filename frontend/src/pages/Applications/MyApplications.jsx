import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function MyApplications() {
  const [applications, setApplications] = useState({
    jobs: [],
    events: [],
    mentorships: [],
    savedJobs: [],
    skills: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      // Fetch job applications
      const jobsRes = await apiClient.get('/api/jobs/applications')
      
      // Fetch event registrations
      const eventsRes = await apiClient.get('/api/events/registrations')
      
      // Fetch mentorship requests
      const mentorshipRes = await apiClient.get('/api/mentorship/requests')
      
      // Fetch saved jobs
      const savedJobsRes = await apiClient.get('/api/jobs/saved')
      
      // Fetch skill requests
      const skillsRes = await apiClient.get('/api/skills/requests')
      
      setApplications({
        jobs: jobsRes.data || [],
        events: eventsRes.data || [],
        mentorships: mentorshipRes.data.sent || [],
        savedJobs: savedJobsRes.data || [],
        skills: skillsRes.data.sent || []
      })
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">My Applications</h1>
        <p className="mt-2 text-text-secondary">Track all your job applications, event registrations, and mentorship requests</p>
      </div>

      {/* Saved Jobs */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Saved Jobs</h2>
        {applications.savedJobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔖</span>
            </div>
            <p className="text-text-secondary">No saved jobs yet</p>
            <p className="text-sm text-text-muted-foreground mt-2">Save interesting opportunities to apply later</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.savedJobs.map(savedJob => (
              <div key={savedJob.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">{savedJob.job_title}</p>
                  <p className="text-sm text-text-secondary">{savedJob.company}</p>
                  {savedJob.location && <p className="text-sm text-text-secondary">{savedJob.location}</p>}
                  <p className="text-xs text-text-muted-foreground">Saved: {new Date(savedJob.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    saved
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Requests */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Skill Requests</h2>
        {applications.skills.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-text-secondary">No skill requests yet</p>
            <p className="text-sm text-text-muted-foreground mt-2">Request skills from alumni to enhance your learning</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.skills.map(skill => (
              <div key={skill.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">{skill.skill_name}</p>
                  <p className="text-sm text-text-secondary">{skill.message}</p>
                  <p className="text-xs text-text-muted-foreground">Requested: {new Date(skill.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    skill.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    skill.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {skill.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Applications */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Job Applications</h2>
        {applications.jobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💼</span>
            </div>
            <p className="text-text-secondary">No job applications yet</p>
            <p className="text-sm text-text-muted-foreground mt-2">Start applying to opportunities from your dashboard</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.jobs.map(application => (
              <div key={application.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">{application.job_title}</p>
                  <p className="text-sm text-text-secondary">{application.company}</p>
                  <p className="text-xs text-text-muted-foreground">Applied: {new Date(application.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {application.status || 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Registrations */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Event Registrations</h2>
        {applications.events.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-text-secondary">No event registrations yet</p>
            <p className="text-sm text-text-muted-foreground mt-2">Register for workshops and events from your dashboard</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.events.map(registration => (
              <div key={registration.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">{registration.event_title}</p>
                  <p className="text-sm text-text-secondary">{new Date(registration.event_time).toLocaleDateString()}</p>
                  <p className="text-xs text-text-muted-foreground">Registered: {new Date(registration.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    registered
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mentorship Requests */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Mentorship Requests</h2>
        {applications.mentorships.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-text-secondary">No mentorship requests yet</p>
            <p className="text-sm text-text-muted-foreground mt-2">Request mentorship from alumni to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.mentorships.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">{request.mentor_name || 'Mentor'}</p>
                  <p className="text-sm text-text-secondary">{request.topic}</p>
                  <p className="text-xs text-text-muted-foreground">Requested: {new Date(request.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
