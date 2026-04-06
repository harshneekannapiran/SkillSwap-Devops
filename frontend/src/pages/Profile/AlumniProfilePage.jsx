import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function AlumniProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    years_of_experience: '',
    bio: '',
    skills_offered: '',
    mentorship_availability: '',
    linkedin_url: '',
    github_url: ''
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
        company: response.data.company || '',
        role: response.data.role || '',
        years_of_experience: response.data.years_of_experience || '',
        bio: response.data.bio || '',
        skills_offered: response.data.skills_offered || '',
        mentorship_availability: response.data.mentorship_availability || '',
        linkedin_url: response.data.linkedin_url || '',
        github_url: response.data.github_url || ''
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
                  Alumni
                </span>
              </div>

              {(profile.company || profile.role) && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Professional Info</h3>
                  {profile.role && <p className="text-text-secondary">{profile.role}</p>}
                  {profile.company && <p className="text-text-secondary">{profile.company}</p>}
                  {profile.years_of_experience && <p className="text-text-secondary">{profile.years_of_experience} years of experience</p>}
                </div>
              )}

              {profile.bio && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">About</h3>
                  <p className="text-text-secondary">{profile.bio}</p>
                </div>
              )}

              {profile.skills_offered && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Skills Offered</h3>
                  <p className="text-text-secondary">{profile.skills_offered}</p>
                </div>
              )}

              {profile.mentorship_availability && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Mentorship Availability</h3>
                  <p className="text-text-secondary">{profile.mentorship_availability}</p>
                </div>
              )}

              {(profile.linkedin_url || profile.github_url) && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Links</h3>
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block">
                      LinkedIn Profile
                    </a>
                  )}
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block">
                      GitHub Profile
                    </a>
                  )}
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
                <label className="block text-sm font-medium text-text-primary mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Years of Experience</label>
              <input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                max="50"
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
                placeholder="Tell us about your professional journey..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Skills Offered</label>
              <textarea
                name="skills_offered"
                value={formData.skills_offered}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                placeholder="What skills can you teach students?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Mentorship Availability</label>
              <textarea
                name="mentorship_availability"
                value={formData.mentorship_availability}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                placeholder="When are you available for mentorship?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">GitHub URL</label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://github.com/yourusername"
                />
              </div>
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
