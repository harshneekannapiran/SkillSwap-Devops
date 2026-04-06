import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function StudentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([])
  const [appliedJobs, setAppliedJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    fetchOpportunities()
  }, [search, location])

  const fetchOpportunities = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (location) params.append('location', location)

      const [jobsRes, applicationsRes, savedRes] = await Promise.all([
        apiClient.get(`/api/jobs?${params}`),
        apiClient.get('/api/jobs/applications'),
        apiClient.get('/api/jobs/saved')
      ])
      
      const appliedJobIds = applicationsRes.data.map(app => app.job_id)
      const savedJobIds = savedRes.data.map(saved => saved.job_id)
      
      // Mark jobs with applied and saved status
      const jobsWithStatus = jobsRes.data.map(job => ({
        ...job,
        isApplied: appliedJobIds.includes(job.id),
        isSaved: savedJobIds.includes(job.id)
      }))
      
      setOpportunities(jobsWithStatus)
      setAppliedJobs(applicationsRes.data)
      setSavedJobs(savedRes.data)
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (job) => {
    // Prevent applying if already applied
    if (job.isApplied) {
      alert('You have already applied to this job! Check your "My Applications" page to track status.')
      return
    }
    
    try {
      await apiClient.post('/api/jobs/apply', { 
        job_id: job.id,
        cover_letter: "I am interested in this opportunity and would like to learn more.",
        resume_url: ""
      })
      alert('Application submitted successfully!')
      
      // Update the job status in the list
      setOpportunities(prev => prev.map(op => 
        op.id === job.id ? { ...op, isApplied: true } : op
      ))
    } catch (error) {
      console.error('Failed to apply:', error)
      if (error.response?.status === 409) {
        alert('You have already applied to this job! Check your "My Applications" page to track status.')
      } else {
        alert('Application could not be submitted at this time. Please try again.')
      }
    }
  }

  const handleSave = async (job) => {
    try {
      await apiClient.post('/api/jobs/save', { job_id: job.id })
      alert('Job saved successfully!')
      
      // Update the job status in the list
      setOpportunities(prev => prev.map(op => 
        op.id === job.id ? { ...op, isSaved: true } : op
      ))
    } catch (error) {
      console.error('Failed to save job:', error)
      if (error.response?.status === 409) {
        alert('Job already saved!')
      } else {
        alert('Could not save job at this time. Please try again.')
      }
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading opportunities...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Opportunities</h1>
        <p className="mt-2 text-text-secondary">Find internships, jobs, and career opportunities</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Opportunities Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.map(opportunity => (
          <div key={opportunity.id} className="bg-card rounded-lg border border-border p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-2">{opportunity.title}</h3>
              <p className="text-text-secondary mb-2">{opportunity.company}</p>
              {opportunity.location && (
                <p className="text-sm text-text-secondary mb-2">📍 {opportunity.location}</p>
              )}
              <p className="text-xs text-text-secondary">
                Posted: {new Date(opportunity.created_at).toLocaleDateString()}
              </p>
            </div>
            
            {opportunity.description && (
              <p className="text-text-secondary mb-4 line-clamp-3">{opportunity.description}</p>
            )}
            
            <div className="flex gap-2">
              {opportunity.isApplied ? (
                <div className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg cursor-not-allowed opacity-75 text-center font-medium">
                  Applied
                </div>
              ) : (
                <button
                  onClick={() => handleApply(opportunity)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Apply
                </button>
              )}
              {opportunity.isSaved ? (
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg cursor-not-allowed opacity-75 text-center font-medium">
                  Saved
                </div>
              ) : (
                <button
                  onClick={() => handleSave(opportunity)}
                  className="px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-background transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-10">
          <p className="text-text-secondary">No opportunities found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
