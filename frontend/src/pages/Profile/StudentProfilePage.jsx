import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function StudentProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    department: '',
    graduation_year: '',
    bio: '',
    skills: '',
    learning_goals: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/api/users/me')
      setProfile(response.data)
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        university: response.data.university || '',
        department: response.data.department || '',
        graduation_year: response.data.graduation_year || '',
        bio: response.data.bio || '',
        skills: response.data.skills || '',
        learning_goals: response.data.learning_goals || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiClient.put('/api/users/me', formData)
      setEditing(false)
      fetchProfile()
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>
  }

  if (!profile) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {!editing ? (
        // View Mode
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-semibold">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary">{profile.name}</h2>
                <p className="text-text-secondary">{profile.email}</p>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mt-2">
                  Student
                </span>
              </div>

              {profile.university && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Education</h3>
                  <p className="text-text-secondary">{profile.university}</p>
                  {profile.department && <p className="text-text-secondary">{profile.department}</p>}
                  {profile.graduation_year && <p className="text-text-secondary">Class of {profile.graduation_year}</p>}
                </div>
              )}

              {profile.bio && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">About</h3>
                  <p className="text-text-secondary">{profile.bio}</p>
                </div>
              )}

              {profile.skills && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Skills</h3>
                  <p className="text-text-secondary">{profile.skills}</p>
                </div>
              )}

              {profile.learning_goals && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Learning Goals</h3>
                  <p className="text-text-secondary">{profile.learning_goals}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">University</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Graduation Year</label>
              <input
                type="number"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="2020"
                max="2030"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Skills</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                placeholder="List your current skills..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Learning Goals</label>
              <textarea
                name="learning_goals"
                value={formData.learning_goals}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                placeholder="What do you want to learn?"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-6 py-3 border border-border text-text-primary rounded-lg hover:bg-background transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
