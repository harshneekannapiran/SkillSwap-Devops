import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function AlumniSkillsPage() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    level: 'Beginner',
    description: ''
  })

  useEffect(() => {
    fetchMySkills()
  }, [])

  const fetchMySkills = async () => {
    try {
      const response = await apiClient.get('/api/skills/mine')
      setSkills(response.data)
    } catch (error) {
      console.error('Failed to fetch skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiClient.post('/api/skills', formData)
      setShowAddForm(false)
      setFormData({ name: '', category: '', level: 'Beginner', description: '' })
      fetchMySkills()
    } catch (error) {
      console.error('Failed to create skill:', error)
      alert('Failed to create skill')
    }
  }

  const handleDelete = async (skillId) => {
    // Show current user for debugging
    const userRaw = localStorage.getItem('skillswap_user')
    const user = userRaw ? JSON.parse(userRaw) : null
    console.log('Current user:', user)
    console.log('Attempting to delete skill:', skillId)
    
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        console.log('Sending delete request to:', `/api/skills/${skillId}`)
        const response = await apiClient.delete(`/api/skills/${skillId}`)
        console.log('Delete response:', response)
        
        // Immediately update state to remove the deleted skill
        setSkills(prev => prev.filter(skill => skill.id !== skillId))
        
        // Close the dialog
        setSelectedSkill(null)
        
        // Then refresh from server to ensure consistency
        await fetchMySkills()
        
        alert('Skill deleted successfully!')
      } catch (error) {
        console.error('Failed to delete skill:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        alert(`Failed to delete skill: ${error.response?.data?.message || 'Unknown error'}`)
      }
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading skills...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Skills</h1>
          <p className="mt-2 text-text-secondary">Manage skills you can teach students</p>
          <p className="mt-1 text-sm text-text-muted-foreground">
            View and manage skill requests in the "View Applicants" page
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Add New Skill
        </button>
      </div>

      {/* Add Skill Form */}
      {showAddForm && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Add New Skill</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Skill Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., React Development"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Category</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Describe what students will learn..."
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Add Skill
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

      {/* Skills List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {skills.map(skill => (
          <div 
            key={skill.id} 
            className="bg-card rounded-lg border border-border p-6 cursor-pointer hover:bg-muted/20 transition-all duration-200 transform hover:scale-105"
            onClick={() => setSelectedSkill(skill)}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2">{skill.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{skill.category}</span>
              <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                {skill.level}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Skill Details Modal */}
      {selectedSkill && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedSkill(null)}
        >
          <div 
            className="bg-card rounded-xl p-6 max-w-lg w-full shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-text-primary">{selectedSkill.name}</h3>
                <p className="text-sm text-text-secondary">{selectedSkill.category}</p>
              </div>
              <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                {selectedSkill.level}
              </span>
            </div>
            
            <p className="text-text-secondary mb-6 leading-relaxed">{selectedSkill.description}</p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleDelete(selectedSkill.id)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                🗑️
              </button>
              <button
                onClick={() => setSelectedSkill(null)}
                className="px-4 py-2 bg-background text-text-primary rounded-lg hover:bg-muted transition-colors border border-border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {skills.length === 0 && !showAddForm && (
        <div className="text-center py-10">
          <p className="text-text-secondary mb-4">You haven't added any skills yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Add Your First Skill
          </button>
        </div>
      )}
    </div>
  )
}
