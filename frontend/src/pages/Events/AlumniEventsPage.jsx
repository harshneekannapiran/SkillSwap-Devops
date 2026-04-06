import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function AlumniEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'workshop',
    location: '',
    event_time: '',
    duration_minutes: 60,
    meeting_link: '',
    max_participants: ''
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get('/api/events/mine')
      setEvents(response.data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiClient.post('/api/events', formData)
      setShowAddForm(false)
      setFormData({
        title: '',
        description: '',
        event_type: 'workshop',
        location: '',
        event_time: '',
        duration_minutes: 60,
        meeting_link: '',
        max_participants: ''
      })
      fetchEvents()
      alert('Event created successfully!')
    } catch (error) {
      console.error('Failed to create event:', error)
      alert('Failed to create event')
    }
  }

  const handleDelete = async (eventId) => {
    console.log('Attempting to delete event:', eventId)
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        console.log('Sending delete request to:', `/api/events/${eventId}`)
        const response = await apiClient.delete(`/api/events/${eventId}`)
        console.log('Delete response:', response)
        
        // Immediately update state to remove the deleted event
        setEvents(prev => prev.filter(event => event.id !== eventId))
        
        // Close the dialog
        setSelectedEvent(null)
        
        // Then refresh from server to ensure consistency
        await fetchEvents()
        
        alert('Event deleted successfully!')
      } catch (error) {
        console.error('Failed to delete event:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        alert(`Failed to delete event: ${error.response?.data?.message || 'Unknown error'}`)
      }
    }
  }

  const handleEdit = async (eventId, data) => {
    try {
      await apiClient.put(`/api/events/${eventId}`, data)
      fetchEvents()
    } catch (error) {
      console.error('Failed to update event:', error)
      alert('Failed to update event')
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading events...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Events</h1>
          <p className="mt-2 text-text-secondary">Create and manage workshops and career sessions</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Create Event
        </button>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Create New Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Event Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Resume Review Workshop"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Event Type</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="workshop">Workshop</option>
                  <option value="career_session">Career Session</option>
                  <option value="networking">Networking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  min="30"
                  max="240"
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
                placeholder="Describe what students will learn and take away from this event..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Room 101, Virtual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Max Participants</label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Event Date & Time</label>
              <input
                type="datetime-local"
                required
                value={formData.event_time}
                onChange={(e) => setFormData({...formData, event_time: e.target.value})}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Meeting Link (Optional)</label>
              <input
                type="url"
                value={formData.meeting_link}
                onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://zoom.us/meeting/..."
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Create Event
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

      {/* Events List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <div 
            key={event.id} 
            className="bg-card rounded-lg border border-border p-6 cursor-pointer hover:bg-muted/20 transition-all duration-200 transform hover:scale-105"
            onClick={() => setSelectedEvent(event)}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2">{event.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                📅 {new Date(event.event_time).toLocaleDateString()}
              </span>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {event.event_type.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-card rounded-xl p-6 max-w-lg w-full shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-text-primary mb-2">{selectedEvent.title}</h3>
            <p className="text-sm text-text-secondary mb-2">
              📅 {new Date(selectedEvent.event_time).toLocaleDateString()}
            </p>
            <p className="text-sm text-text-secondary mb-2">
              🕐 {new Date(selectedEvent.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            {selectedEvent.location && (
              <p className="text-sm text-text-secondary mb-2">📍 {selectedEvent.location}</p>
            )}
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mb-4">
              {selectedEvent.event_type.replace('_', ' ')}
            </span>
            
            {selectedEvent.description && (
              <p className="text-text-secondary mb-6 leading-relaxed">{selectedEvent.description}</p>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-text-secondary">
                {selectedEvent.duration_minutes} min
              </span>
              {selectedEvent.max_participants && (
                <span className="text-sm text-text-secondary">
                  Max: {selectedEvent.max_participants}
                </span>
              )}
            </div>
            
            {selectedEvent.meeting_link && (
              <a
                href={selectedEvent.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:underline mb-6"
              >
                Join Meeting
              </a>
            )}
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleDelete(selectedEvent.id)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                🗑️
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-background text-text-primary rounded-lg hover:bg-muted transition-colors border border-border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 && !showAddForm && (
        <div className="text-center py-10">
          <p className="text-text-secondary mb-4">You haven't created any events yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  )
}
