import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function AlumniOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    link: ''
  })

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      const response = await apiClient.get('/api/jobs/mine')
      setOpportunities(response.data)
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiClient.post('/api/jobs', formData)
      setShowAddForm(false)
      setFormData({ title: '', company: '', location: '', description: '', link: '' })
      fetchOpportunities()
      alert('Opportunity posted successfully!')
    } catch (error) {
      console.error('Failed to create opportunity:', error)
      alert('Failed to post opportunity')
    }
  }

  const handleDelete = async (jobId) => {
    console.log('Attempting to delete opportunity:', jobId)
    if (confirm('Are you sure you want to delete this opportunity?')) {
      try {
        console.log('Sending delete request to:', `/api/jobs/${jobId}`)
        const response = await apiClient.delete(`/api/jobs/${jobId}`)
        console.log('Delete response:', response)
        
        // Immediately update state to remove the deleted opportunity
        setOpportunities(prev => prev.filter(opportunity => opportunity.id !== jobId))
        
        // Close the dialog
        setSelectedOpportunity(null)
        
        // Then refresh from server to ensure consistency
        await fetchOpportunities()
        
        alert('Opportunity deleted successfully!')
      } catch (error) {
        console.error('Failed to delete opportunity:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        alert(`Failed to delete opportunity: ${error.response?.data?.message || 'Unknown error'}`)
      }
    }
  }

  const handleEdit = async (jobId, data) => {
    try {
      await apiClient.put(`/api/jobs/${jobId}`, data)
      fetchOpportunities()
    } catch (error) {
      console.error('Failed to update opportunity:', error)
      alert('Failed to update opportunity')
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading opportunities...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Opportunities</h1>
          <p className="mt-2 text-text-secondary">Post and manage job opportunities for students</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Post Opportunity
        </button>
      </div>

      {/* Add Opportunity Form */}
      {showAddForm && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Post New Opportunity</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Job Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Frontend Developer Intern"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Company</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Tech Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Describe the role, requirements, and what students will learn..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Application Link (Optional)</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://company.com/careers/job-id"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Post Opportunity
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-border text-text-primary rounded-lg hover:bg-background transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Opportunities List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.map(opportunity => (
          <div 
            key={opportunity.id} 
            className="bg-card rounded-lg border border-border p-6 cursor-pointer hover:bg-muted/20 transition-all duration-200 transform hover:scale-105"
            onClick={() => setSelectedOpportunity(opportunity)}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2">{opportunity.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{opportunity.company}</span>
              {opportunity.location && (
                <span className="text-xs text-text-secondary">📍 {opportunity.location}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Opportunity Details Modal */}
      {selectedOpportunity && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedOpportunity(null)}
        >
          <div 
            className="bg-card rounded-xl p-6 max-w-lg w-full shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-text-primary mb-2">{selectedOpportunity.title}</h3>
            <p className="text-text-secondary mb-2">{selectedOpportunity.company}</p>
            {selectedOpportunity.location && (
              <p className="text-sm text-text-secondary mb-2">📍 {selectedOpportunity.location}</p>
            )}
            <p className="text-xs text-text-secondary mb-4">
              Posted: {new Date(selectedOpportunity.created_at).toLocaleDateString()}
            </p>
            
            {selectedOpportunity.description && (
              <p className="text-text-secondary mb-6 leading-relaxed">{selectedOpportunity.description}</p>
            )}
            
            {selectedOpportunity.link && (
              <a
                href={selectedOpportunity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:underline mb-6"
              >
                View Application Link
              </a>
            )}
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleDelete(selectedOpportunity.id)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                🗑️
              </button>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="px-4 py-2 bg-background text-text-primary rounded-lg hover:bg-muted transition-colors border border-border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {opportunities.length === 0 && !showAddForm && (
        <div className="text-center py-10">
          <p className="text-text-secondary mb-4">You haven't posted any opportunities yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Post Your First Opportunity
          </button>
        </div>
      )}
    </div>
  )
}
