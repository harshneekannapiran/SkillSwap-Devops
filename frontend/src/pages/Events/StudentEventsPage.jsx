import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function StudentEventsPage() {
  const [events, setEvents] = useState([])
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [eventType, setEventType] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [eventType, search])

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams()
      if (eventType) params.append('event_type', eventType)
      if (search) params.append('search', search)

      const [eventsRes, registrationsRes] = await Promise.all([
        apiClient.get(`/api/events?${params}`),
        apiClient.get('/api/events/registrations')
      ])
      
      const registeredEventIds = registrationsRes.data.map(reg => reg.event_id)
      
      // Mark events with registered status
      const eventsWithStatus = eventsRes.data.map(event => ({
        ...event,
        isRegistered: registeredEventIds.includes(event.id)
      }))
      
      setEvents(eventsWithStatus)
      setRegisteredEvents(registrationsRes.data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event) => {
    // Prevent registering if already registered
    if (event.isRegistered) {
      alert('You are already registered for this event! Check your "My Applications" page for details.')
      return
    }
    
    try {
      await apiClient.post('/api/events/register', { 
        event_id: event.id,
        notes: "Looking forward to attending this event!"
      })
      alert('Successfully registered for event!')
      
      // Update the event status in the list
      setEvents(prev => prev.map(ev => 
        ev.id === event.id ? { ...ev, isRegistered: true } : ev
      ))
    } catch (error) {
      console.error('Failed to register for event:', error)
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
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading events...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Events</h1>
        <p className="mt-2 text-text-secondary">Join workshops, career sessions, and networking events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Events</option>
          <option value="workshop">Workshops</option>
          <option value="career_session">Career Sessions</option>
          <option value="networking">Networking</option>
        </select>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <div key={event.id} className="bg-card rounded-lg border border-border p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-2">{event.title}</h3>
              <p className="text-sm text-text-secondary mb-2">
                📅 {new Date(event.event_time).toLocaleDateString()}
              </p>
              <p className="text-sm text-text-secondary mb-2">
                🕐 {new Date(event.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              {event.location && (
                <p className="text-sm text-text-secondary mb-2">📍 {event.location}</p>
              )}
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {event.event_type.replace('_', ' ')}
              </span>
            </div>
            
            {event.description && (
              <p className="text-text-secondary mb-4 line-clamp-3">{event.description}</p>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-secondary">
                Host: {event.host_name}
              </span>
              {event.duration_minutes && (
                <span className="text-sm text-text-secondary">
                  {event.duration_minutes} min
                </span>
              )}
            </div>
            
            {event.isRegistered ? (
              <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg cursor-not-allowed opacity-75 text-center font-medium">
                Registered
              </div>
            ) : (
              <button
                onClick={() => handleRegister(event)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Register
              </button>
            )}
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-10">
          <p className="text-text-secondary">No events found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
