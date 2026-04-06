import { useState, useEffect } from 'react'
import { DashboardCard } from '../../components/common/DashboardCard.jsx'
import { JobApplicationForm } from '../../components/common/JobApplicationForm.jsx'
import { EventRegistrationForm } from '../../components/common/EventRegistrationForm.jsx'
import { apiClient } from '../../services/apiClient.js'

export function StudentDashboard() {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('skillswap_user') : null
  const user = userRaw ? JSON.parse(userRaw) : null
  const [stats, setStats] = useState({
    recommendedMentors: 0,
    skillsRequested: 0,
    pendingRequests: 0,
    upcomingSessions: 0,
    newOpportunities: 0,
    eventSuggestions: 0
  })
  const [loading, setLoading] = useState(true)
  const [recommendedMentors, setRecommendedMentors] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [newOpportunities, setNewOpportunities] = useState([])
  const [eventSuggestions, setEventSuggestions] = useState([])
  const [showJobForm, setShowJobForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('skillswap_token')
        const userRaw = localStorage.getItem('skillswap_user')
        const user = userRaw ? JSON.parse(userRaw) : null
        
        console.log('Fetching student dashboard data...')
        console.log('Token exists:', !!token)
        console.log('User:', user)

        if (!token || !user) {
          console.log('No token or user found, skipping dashboard fetch')
          return
        }

        // Fetch mentorship requests
        try {
          const mentorshipRes = await apiClient.get('/api/mentorship/requests')
          console.log('Mentorship requests response:', mentorshipRes.status, mentorshipRes.data)
          const pendingRequests = mentorshipRes.data.sent?.filter(r => r.status === 'pending').length || 0
          const acceptedRequests = mentorshipRes.data.sent?.filter(r => r.status === 'accepted').length || 0
          
          // Fetch skills requested
          try {
            const skillsRes = await apiClient.get('/api/skills/requests')
            console.log('Skills requests response:', skillsRes.status, skillsRes.data)
            const skillsRequested = skillsRes.data.sent?.filter(req => req.requester_id === user.id).length || 0

            // Fetch mentors (recommended)
            try {
              const [mentorsRes, mentorshipRes] = await Promise.all([
                apiClient.get('/api/mentorship/mentors'),
                apiClient.get('/api/mentorship/requests')
              ])
              console.log('Mentors response:', mentorsRes.status, mentorsRes.data)
              console.log('Mentorship requests response:', mentorshipRes.status, mentorshipRes.data)
              
              const allMentors = mentorsRes.data.slice(0, 3) // Top 3 recommendations
              const requestedMentorIds = mentorshipRes.data.sent?.map(req => req.mentor_id) || []
              
              // Mark mentors with requested status
              const mentors = allMentors.map(mentor => ({
                ...mentor,
                isRequested: requestedMentorIds.includes(mentor.id)
              }))
              
              console.log('Mentors with status:', mentors)

              // Fetch opportunities
              try {
                const jobsRes = await apiClient.get('/api/jobs')
                console.log('Jobs response:', jobsRes.status, jobsRes.data)
                const allJobs = jobsRes.data.slice(0, 5)
                
                // Fetch my applications to check applied status
                const myApplicationsRes = await apiClient.get('/api/jobs/applications')
                const appliedJobIds = myApplicationsRes.data.map(app => app.job_id)
                
                // Mark jobs with applied status
                const jobsWithStatus = allJobs.map(job => ({
                  ...job,
                  isApplied: appliedJobIds.includes(job.id)
                }))

                // Fetch events
                try {
                  const eventsRes = await apiClient.get('/api/events')
                  console.log('Events response:', eventsRes.status, eventsRes.data)
                  const allEvents = eventsRes.data.slice(0, 3)
                  
                  // Fetch my registrations to check registered status
                  const myRegistrationsRes = await apiClient.get('/api/events/registrations')
                  const registeredEventIds = myRegistrationsRes.data.map(reg => reg.event_id)
                  
                  // Mark events with registered status
                  const eventsWithStatus = allEvents.map(event => ({
                    ...event,
                    isRegistered: registeredEventIds.includes(event.id)
                  }))

                  console.log('All data fetched successfully!')
                  console.log('Final stats:', {
                    recommendedMentors: mentors.length,
                    skillsRequested,
                    pendingRequests,
                    upcomingSessions: acceptedRequests,
                    newOpportunities: jobsWithStatus.filter(job => !job.isApplied).length,
                    eventSuggestions: eventsWithStatus.filter(event => !event.isRegistered).length
                  })

                  setStats({
                    recommendedMentors: mentors.length,
                    skillsRequested,
                    pendingRequests,
                    upcomingSessions: acceptedRequests,
                    newOpportunities: jobsWithStatus.filter(job => !job.isApplied).length,
                    eventSuggestions: eventsWithStatus.filter(event => !event.isRegistered).length
                  })

                  setRecommendedMentors(mentors)
                  setUpcomingSessions(acceptedRequests)
                  setNewOpportunities(jobsWithStatus)
                  setEventSuggestions(eventsWithStatus)
                } catch (eventsError) {
                  console.error('Failed to fetch events:', eventsError)
                  console.error('Events error details:', eventsError.response?.data || eventsError.message)
                  setStats(prev => ({ ...prev, eventSuggestions: 0 }))
                  setEventSuggestions([])
                }
              } catch (jobsError) {
                console.error('Failed to fetch jobs:', jobsError)
                console.error('Jobs error details:', jobsError.response?.data || jobsError.message)
                setStats(prev => ({ ...prev, newOpportunities: 0 }))
                setNewOpportunities([])
              }
            } catch (mentorsError) {
              console.error('Failed to fetch mentors:', mentorsError)
              console.error('Mentors error details:', mentorsError.response?.data || mentorsError.message)
              setStats(prev => ({ ...prev, recommendedMentors: 0 }))
              setRecommendedMentors([])
            }
          } catch (skillsError) {
            console.error('Failed to fetch skills:', skillsError)
            console.error('Skills error details:', skillsError.response?.data || skillsError.message)
            setStats(prev => ({ ...prev, skillsRequested: 0 }))
          }
        } catch (mentorshipError) {
          console.error('Failed to fetch mentorship requests:', mentorshipError)
          console.error('Mentorship error details:', mentorshipError.response?.data || mentorshipError.message)
          setStats(prev => ({ ...prev, pendingRequests: 0, upcomingSessions: 0 }))
        }
      } catch (error) {
        console.error('Failed to fetch student dashboard data:', error)
        console.error('General error details:', error.response?.data || error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [])

  const handleRequestMentorship = async (mentor) => {
    // Prevent requesting if already requested
    if (mentor.isRequested) {
      alert('You have already requested mentorship from this mentor! Check your "My Applications" page to track status.')
      return
    }
    
    try {
      await apiClient.post('/api/mentorship/requests', {
        mentor_id: mentor.id,
        topic: 'Career Guidance',
        message: 'I would like to learn from your experience.'
      })
      alert('Mentorship request sent successfully!')
      
      // Refresh the data without page reload
      const userRaw = localStorage.getItem('skillswap_user')
      const user = userRaw ? JSON.parse(userRaw) : null
      
      // Fetch updated mentorship requests
      const mentorshipRes = await apiClient.get('/api/mentorship/requests')
      const pendingRequests = mentorshipRes.data.sent?.filter(r => r.status === 'pending').length || 0
      const acceptedRequests = mentorshipRes.data.sent?.filter(r => r.status === 'accepted').length || 0
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingRequests,
        upcomingSessions: acceptedRequests
      }))
      
      // Remove the mentor from the recommended list since request was sent
      setRecommendedMentors(prev => prev.map(m => 
        m.id === mentor.id ? { ...m, isRequested: true } : m
      ))
    } catch (error) {
      console.error('Failed to request mentorship:', error)
      if (error.response?.status === 409) {
        alert('You have already requested mentorship from this mentor!')
      } else {
        alert('Failed to send mentorship request. Please try again.')
      }
    }
  }

  const handleApplyToOpportunity = (job) => {
    // Prevent applying if already applied
    if (job.isApplied) {
      alert('You have already applied to this job! Check your "My Applications" page to track status.')
      return
    }
    
    setSelectedJob(job)
    setShowJobForm(true)
  }

  const handleJobApplicationSubmit = async (applicationData) => {
    try {
      await apiClient.post('/api/jobs/apply', applicationData)
      alert('Application submitted successfully!')
      
      // Remove the job from the list since application was sent
      setNewOpportunities(prev => prev.filter(opportunity => opportunity.id !== applicationData.job_id))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        newOpportunities: prev.newOpportunities - 1
      }))
    } catch (error) {
      console.error('Failed to apply:', error)
      
      // Show specific error message
      if (error.response?.status === 409) {
        const errorMessage = error.response.data?.message || 'Application conflict'
        if (errorMessage.includes('Already applied')) {
          alert('You have already applied to this job! Check your "My Applications" page to track status.')
        } else {
          alert(`Application note: ${errorMessage}`)
        }
      } else {
        alert('Application could not be submitted at this time. Please try again.')
      }
      
      throw error // Re-throw to let form handle it
    }
  }

  const handleJoinEvent = (event) => {
    // Prevent registering if already registered
    if (event.isRegistered) {
      alert('You are already registered for this event! Check your "My Applications" page for details.')
      return
    }
    
    setSelectedEvent(event)
    setShowEventForm(true)
  }

  const handleEventRegistrationSubmit = async (registrationData) => {
    try {
      await apiClient.post('/api/events/register', registrationData)
      alert('Successfully registered for event!')
      
      // Remove the event from the list since registration was sent
      setEventSuggestions(prev => prev.filter(event => event.id !== registrationData.event_id))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        eventSuggestions: prev.eventSuggestions - 1
      }))
    } catch (error) {
      console.error('Failed to join event:', error)
      
      // Show specific error message
      if (error.response?.status === 409) {
        const errorMessage = error.response.data?.message || 'Registration conflict'
        if (errorMessage.includes('Already registered')) {
          alert('You are already registered for this event! Check your "My Applications" page for details.')
        } else if (errorMessage.includes('Event is full')) {
          alert('This event has reached maximum capacity. Registration is now closed.')
        } else {
          alert(`Registration note: ${errorMessage}`)
        }
      } else {
        alert('Registration could not be completed at this time. Please try again.')
      }
      
      throw error // Re-throw to let form handle it
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Student Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-text-primary">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-2 text-base text-gray-600 max-w-xl">
            Track your learning journey, connect with mentors, and discover opportunities.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
        <DashboardCard
          label="Recommended Mentors"
          value={loading ? '...' : stats.recommendedMentors}
          description="Alumni ready to guide you"
        />
        <DashboardCard
          label="Skills Requested"
          value={loading ? '...' : stats.skillsRequested}
          description="Skills you're learning"
        />
        <DashboardCard
          label="Pending Requests"
          value={loading ? '...' : stats.pendingRequests}
          description="Mentorship requests pending"
        />
        <DashboardCard
          label="Upcoming Sessions"
          value={loading ? '...' : stats.upcomingSessions}
          description="Accepted mentorships"
        />
        <DashboardCard
          label="New Opportunities"
          value={loading ? '...' : stats.newOpportunities}
          description="Jobs and internships"
        />
        <DashboardCard
          label="Event Suggestions"
          value={loading ? '...' : stats.eventSuggestions}
          description="Workshops and sessions"
        />
      </div>

      {/* Recommended Mentors */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Recommended Mentors</h2>
        {recommendedMentors.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-text-secondary">No mentors available right now</p>
            <p className="text-sm text-text-muted-foreground mt-2">Check back later for mentor recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendedMentors.map(mentor => (
              <div key={mentor.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    {mentor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{mentor.name}</p>
                    <p className="text-sm text-text-secondary">{mentor.company}</p>
                  </div>
                </div>
                {mentor.isRequested ? (
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg cursor-not-allowed opacity-75 text-center font-medium">
                  Requested
                </div>
              ) : (
                <button
                  onClick={() => handleRequestMentorship(mentor)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Request Mentorship
                </button>
              )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Mentorship Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Upcoming Mentorship Sessions</h2>
          <div className="space-y-4">
            {upcomingSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
                    {session.mentor_name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{session.mentor_name}</p>
                    <p className="text-sm text-text-secondary">{session.topic}</p>
                    <p className="text-xs text-text-muted-foreground">Accepted: {new Date(session.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg cursor-not-allowed opacity-75 text-center font-medium">
                  Session Active
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Opportunities */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">New Opportunities</h2>
        {newOpportunities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💼</span>
            </div>
            <p className="text-text-secondary">No opportunities available right now</p>
            <p className="text-sm text-text-muted-foreground mt-2">Check back later for new job postings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {newOpportunities.map(opportunity => (
              <div key={opportunity.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">{opportunity.title}</p>
                  <p className="text-sm text-text-secondary">{opportunity.company}</p>
                  <p className="text-sm text-text-secondary">{opportunity.location}</p>
                </div>
                {opportunity.isApplied ? (
                  <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg cursor-not-allowed opacity-75 text-center font-medium">
                    Applied
                  </div>
                ) : (
                  <button
                    onClick={() => handleApplyToOpportunity(opportunity)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    Apply
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Suggestions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Upcoming Events</h2>
        {eventSuggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-text-secondary">No events scheduled right now</p>
            <p className="text-sm text-text-muted-foreground mt-2">Check back later for upcoming workshops and sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventSuggestions.map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">{event.title}</p>
                  <p className="text-sm text-text-secondary">{new Date(event.event_time).toLocaleDateString()}</p>
                  <p className="text-sm text-text-secondary">{event.location}</p>
                </div>
                {event.isRegistered ? (
                  <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg cursor-not-allowed opacity-75 text-center font-medium">
                    Registered
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinEvent(event)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    Join Event
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Forms */}
      <JobApplicationForm
        job={selectedJob}
        isOpen={showJobForm}
        onClose={() => setShowJobForm(false)}
        onSubmit={handleJobApplicationSubmit}
      />
      
      <EventRegistrationForm
        event={selectedEvent}
        isOpen={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSubmit={handleEventRegistrationSubmit}
      />
    </div>
  )
}
