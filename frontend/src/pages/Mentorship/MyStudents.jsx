import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/apiClient'

const MyStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyStudents()
  }, [])

  const fetchMyStudents = async () => {
    try {
      setLoading(true)
      console.log('Fetching students data...')
      const response = await apiClient.get('/api/mentorship/my-students')
      console.log('Students data received:', response.data)
      setStudents(response.data.students)
    } catch (error) {
      console.error('Failed to fetch students:', error)
      
      // Handle different types of errors
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.error('Network/CORS error detected')
        alert('Unable to connect to the server. Please check if the backend is running and accessible.')
      } else if (error.response?.status === 401) {
        console.error('Authentication error')
        alert('Please log in again to access this page.')
      } else {
        console.error('Unexpected error:', error.response?.data || error.message)
        alert('Failed to fetch students information. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChat = (studentId) => {
    navigate(`/chat?user=${studentId}`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-text-secondary">Loading students...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">My Students</h1>
          <p className="text-text-secondary">View and connect with your mentored students</p>
        </div>

        {students.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Students Yet</h3>
            <p className="text-text-secondary mb-6">
              You haven't accepted any mentorship requests yet. 
              Check the View Applicants page to see pending requests.
            </p>
            <button
              onClick={() => navigate('/view-applicants')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              View Applicants
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Total Students</h3>
                  <p className="text-text-secondary">Active mentorship relationships</p>
                </div>
                <div className="text-3xl font-bold text-primary">{students.length}</div>
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {students.map(({ student, mentorship }) => (
                <div key={student.id} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Student Header */}
                  <div className="bg-gradient-to-r from-primary to-indigo-600 p-4 text-white">
                    <h3 className="text-xl font-bold">{student.name}</h3>
                    <p className="text-primary-100">Student</p>
                  </div>

                  {/* Student Content */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {/* Basic Info */}
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">About</h4>
                        <p className="text-text-secondary text-sm line-clamp-2">
                          {student.bio || 'No bio available'}
                        </p>
                      </div>

                      {/* Education */}
                      {student.education && (
                        <div>
                          <h4 className="font-semibold text-text-primary mb-1">Education</h4>
                          <p className="text-text-secondary text-sm">{student.education}</p>
                          {student.graduation_year && (
                            <p className="text-text-secondary text-xs">Class of {student.graduation_year}</p>
                          )}
                        </div>
                      )}

                      {/* Skills */}
                      {student.skills && student.skills.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-text-primary mb-1">Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {student.skills.slice(0, 3).map((skill, index) => (
                              <span key={index} 
                                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                {skill}
                              </span>
                            ))}
                            {student.skills.length > 3 && (
                              <span className="text-xs text-text-secondary">
                                +{student.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Interests */}
                      {student.interests && student.interests.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-text-primary mb-1">Interests</h4>
                          <div className="flex flex-wrap gap-1">
                            {student.interests.slice(0, 3).map((interest, index) => (
                              <span key={index} 
                                    className="px-2 py-1 bg-muted text-text-secondary rounded text-xs">
                                {interest}
                              </span>
                            ))}
                            {student.interests.length > 3 && (
                              <span className="text-xs text-text-secondary">
                                +{student.interests.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Mentorship Info */}
                      <div className="bg-muted rounded p-3">
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium text-text-primary">Topic:</span> {mentorship.topic}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-text-primary">Started:</span> {formatDate(mentorship.created_at)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-text-primary">Status:</span>
                            <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                              {mentorship.status}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleChat(student.id)}
                          className="flex-1 px-3 py-2 bg-primary text-white rounded text-sm hover:bg-indigo-600 transition-colors"
                        >
                          💬 Chat
                        </button>
                        <button
                          onClick={() => setSelectedStudent({ student, mentorship })}
                          className="px-3 py-2 border border-border text-text-primary rounded text-sm hover:bg-muted transition-colors"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-primary">{selectedStudent.student.name}</h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Bio */}
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">About</h3>
                  <p className="text-text-secondary">
                    {selectedStudent.student.bio || 'No bio available'}
                  </p>
                </div>

                {/* Education */}
                {selectedStudent.student.education && (
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Education</h3>
                    <p className="text-text-secondary">{selectedStudent.student.education}</p>
                    {selectedStudent.student.graduation_year && (
                      <p className="text-text-secondary text-sm">Class of {selectedStudent.student.graduation_year}</p>
                    )}
                  </div>
                )}

                {/* Skills */}
                {selectedStudent.student.skills && selectedStudent.student.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.student.skills.map((skill, index) => (
                        <span key={index} 
                              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {selectedStudent.student.interests && selectedStudent.student.interests.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.student.interests.map((interest, index) => (
                        <span key={index} 
                              className="px-3 py-1 bg-muted text-text-secondary rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mentorship Details */}
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold text-text-primary mb-2">Mentorship Details</h3>
                  <div className="space-y-2">
                    <p className="text-text-secondary">
                      <span className="font-medium">Topic:</span> {selectedStudent.mentorship.topic}
                    </p>
                    <p className="text-text-secondary">
                      <span className="font-medium">Status:</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {selectedStudent.mentorship.status}
                      </span>
                    </p>
                    <p className="text-text-secondary">
                      <span className="font-medium">Started:</span> {formatDate(selectedStudent.mentorship.created_at)}
                    </p>
                    {selectedStudent.mentorship.message && (
                      <div>
                        <span className="font-medium text-text-secondary">Message:</span>
                        <p className="text-text-secondary mt-1">{selectedStudent.mentorship.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Contact</h3>
                  <p className="text-text-secondary">{selectedStudent.student.email}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleChat(selectedStudent.student.id)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    💬 Chat with Student
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyStudents
