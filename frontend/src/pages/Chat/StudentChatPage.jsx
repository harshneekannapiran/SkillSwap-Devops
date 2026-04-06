import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function StudentChatPage() {
  const [mentorshipRequests, setMentorshipRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMentorshipRequests()
  }, [])

  useEffect(() => {
    if (selectedRequest) {
      fetchMessages(selectedRequest.mentor_id)
    }
  }, [selectedRequest])

  const fetchMentorshipRequests = async () => {
    try {
      const response = await apiClient.get('/api/mentorship/requests')
      const requests = response.data.sent || []
      const acceptedRequests = requests.filter(r => r.status === 'accepted')
      setMentorshipRequests(acceptedRequests)
      console.log('StudentChatPage: Accepted requests:', acceptedRequests)
    } catch (error) {
      console.error('Failed to fetch mentorship requests:', error)
      setMentorshipRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (mentorId) => {
    try {
      const response = await apiClient.get(`/api/chat/messages/${mentorId}`)
      setMessages(response.data || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setMessages([])
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) {
      console.log('Cannot send message:', { newMessage: newMessage.trim(), selectedRequest })
      return
    }

    const messageData = {
      content: newMessage
    }

    console.log('Sending message:', { 
      to: selectedRequest.mentor_id, 
      data: messageData,
      url: `/api/chat/messages/${selectedRequest.mentor_id}`
    })

    try {
      const response = await apiClient.post(`/api/chat/messages/${selectedRequest.mentor_id}`, messageData)
      console.log('Message sent successfully:', response.data)
      setNewMessage('')
      fetchMessages(selectedRequest.mentor_id)
    } catch (error) {
      console.error('Failed to send message:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      alert(`Failed to send message: ${error.response?.data?.message || error.message || 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading mentors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {/* Mentors List */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border bg-card">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">My Mentors</h2>
            <p className="text-sm text-text-secondary">Chat with your mentors</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mentorshipRequests.length === 0 ? (
            <div className="p-4 text-center text-text-secondary">
              <div className="mb-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="font-medium text-text-primary mb-2">No mentors yet</p>
                <p className="text-sm">Wait for alumni to accept your mentorship requests!</p>
              </div>
            </div>
          ) : (
            mentorshipRequests.map(request => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/20 transition-colors ${
                  selectedRequest?.id === request.id ? 'bg-muted/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    {request.mentor_name?.charAt(0) || 'M'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{request.mentor_name || 'Mentor'}</p>
                    <p className="text-sm text-text-secondary truncate">
                      {request.topic || 'Mentorship'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRequest ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {selectedRequest.mentor_name?.charAt(0) || 'M'}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{selectedRequest.mentor_name || 'Mentor'}</p>
                  <p className="text-sm text-text-secondary">Mentor</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center text-text-secondary">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="font-medium text-text-primary mb-2">Start the conversation</p>
                  <p className="text-sm">Send a message to begin chatting with your mentor</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === JSON.parse(localStorage.getItem('skillswap_user'))?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl ${
                        message.sender_id === JSON.parse(localStorage.getItem('skillswap_user'))?.id
                          ? 'bg-primary text-white'
                          : 'bg-muted text-text-primary'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === JSON.parse(localStorage.getItem('skillswap_user'))?.id ? 'text-purple-200' : 'text-text-muted-foreground'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card flex-shrink-0">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-border bg-background text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Select a mentor to chat</h3>
              <p className="text-text-secondary">Choose a mentor from the list to start learning</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
