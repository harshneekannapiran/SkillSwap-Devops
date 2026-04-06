import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient.js'

export function StudentSkillsPage() {
  const [skills, setSkills] = useState([])
  const [requestedSkillIds, setRequestedSkillIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')

  useEffect(() => {
    fetchSkills()
  }, [search, category, level])

  const fetchSkills = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      if (level) params.append('level', level)

      const [skillsRes, requestsRes] = await Promise.all([
        apiClient.get(`/api/skills?${params}`),
        apiClient.get('/api/skills/requests')
      ])
      
      const requestedIds = requestsRes.data.sent?.map(req => req.skill_id) || []
      
      // Mark skills with requested status
      const skillsWithStatus = skillsRes.data.map(skill => ({
        ...skill,
        isRequested: requestedIds.includes(skill.id)
      }))
      
      setSkills(skillsWithStatus)
      setRequestedSkillIds(requestedIds)
    } catch (error) {
      console.error('Failed to fetch skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSkill = async (skill) => {
    // Prevent requesting if already requested
    if (skill.isRequested) {
      alert('You have already requested this skill! Check your "My Applications" page for status.')
      return
    }
    
    try {
      await apiClient.post('/api/skills/requests', {
        skill_id: skill.id,
        message: `I would like to learn ${skill.name} from your experience.`
      })
      alert(`Skill request for "${skill.name}" sent successfully!`)
      
      // Update the skill status in the list
      setSkills(prev => prev.map(s => 
        s.id === skill.id ? { ...s, isRequested: true } : s
      ))
    } catch (error) {
      console.error('Failed to request skill:', error)
      if (error.response?.status === 409) {
        alert('You have already requested this skill.')
      } else {
        alert('Failed to send skill request')
      }
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading skills...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Browse Skills</h1>
        <p className="mt-2 text-text-secondary">Learn new skills from experienced alumni</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          <option value="Programming">Programming</option>
          <option value="Design">Design</option>
          <option value="Business">Business</option>
          <option value="Data Science">Data Science</option>
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Skills Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {skills.map(skill => (
          <div key={skill.id} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{skill.name}</h3>
                <p className="text-sm text-text-secondary">{skill.category}</p>
              </div>
              <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                {skill.level}
              </span>
            </div>
            
            <p className="text-text-secondary mb-4">{skill.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                  {skill.owner_name?.charAt(0) || 'A'}
                </div>
                <span className="text-sm text-text-secondary">{skill.owner_name || 'Alumni'}</span>
              </div>
              {skill.isRequested ? (
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg cursor-not-allowed opacity-75 text-center font-medium">
                  Requested
                </div>
              ) : (
                <button
                  onClick={() => handleRequestSkill(skill)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Request to Learn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-10">
          <p className="text-text-secondary">No skills found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
