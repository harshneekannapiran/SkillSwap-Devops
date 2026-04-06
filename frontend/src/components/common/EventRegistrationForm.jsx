import { useState } from 'react'

export function EventRegistrationForm({ event, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSubmit({
        event_id: event.id,
        notes: formData.notes
      })
      onClose()
      setFormData({ notes: '' })
    } catch (error) {
      console.error('Registration failed:', error)
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
          Register for {event.title}
        </h2>
        
        <div className="mb-4">
          <p className="text-sm text-text-secondary">
            <span className="font-medium">Date:</span> {new Date(event.event_time).toLocaleDateString()}
          </p>
          <p className="text-sm text-text-secondary">
            <span className="font-medium">Location:</span> {event.location}
          </p>
          <p className="text-sm text-text-secondary">
            <span className="font-medium">Type:</span> {event.event_type}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Any special requirements or questions about the event..."
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-text-secondary">
              By registering, you confirm that you will attend this event. 
              You will receive further details via email or chat.
            </p>
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
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
