import { useState } from 'react'

export function JobApplicationForm({ job, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_url: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSubmit({
        job_id: job.id,
        cover_letter: formData.cover_letter,
        resume_url: formData.resume_url
      })
      onClose()
      setFormData({ cover_letter: '', resume_url: '' })
    } catch (error) {
      console.error('Application failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Apply for {job.title}
        </h2>
        
        <div className="mb-4">
          <p className="text-sm text-text-secondary">
            <span className="font-medium">Company:</span> {job.company}
          </p>
          <p className="text-sm text-text-secondary">
            <span className="font-medium">Location:</span> {job.location}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Cover Letter *
            </label>
            <textarea
              name="cover_letter"
              value={formData.cover_letter}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Tell us why you're interested in this position and what makes you a good fit..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Resume URL (optional)
            </label>
            <input
              type="url"
              name="resume_url"
              value={formData.resume_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://example.com/resume.pdf"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
