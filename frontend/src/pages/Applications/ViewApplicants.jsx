import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function ViewApplicants() {
  const [applicants, setApplicants] = useState({
    jobs: [],
    events: [],
    mentorships: [],
    skills: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      // Fetch job applications for my posted jobs
      const jobsRes = await apiClient.get('/api/jobs/my-applications')
      
      // Fetch event registrations for my posted events
      const eventsRes = await apiClient.get('/api/events/my-registrations')
      
      // Fetch mentorship requests sent to me
      const mentorshipRes = await apiClient.get('/api/mentorship/requests')
      
      // Fetch skill requests for my skills
      const skillsRes = await apiClient.get('/api/skills/requests')
      
      setApplicants({
        jobs: jobsRes.data || [],
        events: eventsRes.data || [],
        mentorships: mentorshipRes.data.received || [],
        skills: skillsRes.data.received || []
      })
    } catch (error) {
      console.error('Failed to fetch applicants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateJobApplication = async (applicationId, status) => {
    try {
      await apiClient.put(`/api/jobs/applications/${applicationId}`, { status })
      alert(`Application ${status}!`)
      fetchApplicants() // Refresh data
    } catch (error) {
      console.error('Failed to update application:', error)
      alert('Failed to update application status')
    }
  }

  const handleUpdateMentorshipRequest = async (requestId, status) => {
    try {
      await apiClient.put(`/api/mentorship/requests/${requestId}`, { status })
      alert(`Request ${status}!`)
      fetchApplicants() // Refresh data
    } catch (error) {
      console.error('Failed to update mentorship request:', error)
      alert('Failed to update request status')
    }
  }

  const handleUpdateSkillRequest = async (requestId, status) => {
    try {
      await apiClient.put(`/api/skills/requests/${requestId}/${status}`)
      fetchApplicants()
    } catch (error) {
      console.error('Failed to update skill request:', error)
      alert('Failed to update skill request')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading applicants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Applicants</h1>
        <p className="mt-2 text-text-secondary">Review applications for your jobs, events, and mentorship requests</p>
      </div>

      {/* Job Applicants */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Job Applicants</h2>
        {applicants.jobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💼</span>
            </div>
            <p className="text-text-secondary">No job applicants yet</p>
            <p className="text-sm text-text-muted-foreground mt-2">Students will apply to your posted jobs here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.jobs.map(application => (
              <div key={application.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{application.applicant_name}</p>
                  <p className="text-sm text-text-secondary">Applied for: {application.job_title}</p>
                  <p className="text-xs text-text-muted-foreground">Applied: {new Date(application.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {application.status || 'pending'}
                  </span>
                  {application.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateJobApplication(application.id, 'accepted')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateJobApplication(application.id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Registrations */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Event Registrations</h2>
        {applicants.events.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-text-secondary">No event registrations yet</p>
            <p className="text-sm text-text-muted-foreground mt-2">Students will register for your events here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.events.map(registration => (
              <div key={registration.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">{registration.attendee_name}</p>
                  <p className="text-sm text-text-secondary">Registered for: {registration.event_title}</p>
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
        {applicants.mentorships.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-text-secondary">No mentorship requests yet</p>
            <p className="text-sm text-text-muted-foreground mt-2">Students will request mentorship from you here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.mentorships.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{request.student_name}</p>
                  <p className="text-sm text-text-secondary">Topic: {request.topic}</p>
                  <p className="text-xs text-text-muted-foreground">Requested: {new Date(request.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateMentorshipRequest(request.id, 'accepted')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateMentorshipRequest(request.id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Requests */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Skill Requests</h2>
        {applicants.skills.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-text-secondary">No skill requests yet</p>
            <p className="text-sm text-text-muted-foreground mt-2">Students will request to learn your skills here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.skills.map(skill => (
              <div key={skill.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{skill.requester_name}</p>
                  <p className="text-sm text-text-secondary">Wants to learn: {skill.skill_name}</p>
                  {skill.message && (
                    <p className="text-sm text-text-secondary mt-1">"{skill.message}"</p>
                  )}
                  <p className="text-xs text-text-muted-foreground">Requested: {new Date(skill.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    skill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    skill.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    skill.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {skill.status}
                  </span>
                  {skill.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateSkillRequest(skill.id, 'accepted')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateSkillRequest(skill.id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
