import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/apiClient'

const DiscussionForum = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('latest')
  const [selectedTag, setSelectedTag] = useState(null)
  const [tags, setTags] = useState([])
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('skillswap_user') || '{}')

  // Simple date formatting function
  const formatDistanceToNow = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  useEffect(() => {
    fetchPosts()
    fetchTags()
  }, [sortBy, selectedTag, currentPage])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        sort_by: sortBy
      })
      
      if (selectedTag) {
        params.append('tag', selectedTag)
      }

      const response = await apiClient.get(`/api/forum?${params}`)
      setPosts(response.data.posts)
      setTotalPages(response.data.pages)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await apiClient.get('/api/forum/tags')
      setTags(response.data)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const handlePostClick = (postId) => {
    navigate(`/forum/${postId}`)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const handleTagFilter = (tagId) => {
    setSelectedTag(tagId === selectedTag ? null : tagId)
    setCurrentPage(1)
  }

  const getVoteScore = (post) => {
    return post.upvote_count - post.downvote_count
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-text-secondary">Loading forum...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Discussion Forum</h1>
          <p className="text-text-secondary">Ask questions, share knowledge, and help others learn</p>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNewPostModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                ➕ Ask Question
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="latest">Latest</option>
                <option value="popular">Popular</option>
                <option value="unanswered">Unanswered</option>
              </select>
            </div>

            {/* Tags Filter */}
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagFilter(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tag.id
                      ? 'bg-primary text-white'
                      : 'bg-muted text-text-secondary hover:bg-muted/70'
                  }`}
                  style={{ backgroundColor: selectedTag === tag.id ? tag.color : undefined }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">No questions yet</h3>
              <p className="text-text-secondary mb-4">Be the first to ask a question!</p>
              <button
                onClick={() => setShowNewPostModal(true)}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Ask First Question
              </button>
            </div>
          ) : (
            posts.map(post => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post.id)}
                className="bg-card rounded-lg border border-border p-6 cursor-pointer hover:bg-muted/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-text-secondary mb-4 line-clamp-2">{post.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <span>👤 {post.author_name}</span>
                        <span>🎓 {post.author_role}</span>
                        <span>📅 {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        <span>👁️ {post.views} views</span>
                        <span>💬 {post.answer_count} answers</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {post.best_answer_id && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            ✓ Solved
                          </span>
                        )}
                        <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded">
                          <span>👍</span>
                          <span className="text-sm font-medium">{getVoteScore(post)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map(tag => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 rounded-full text-xs text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <NewPostModal
          onClose={() => setShowNewPostModal(false)}
          onSuccess={() => {
            setShowNewPostModal(false)
            fetchPosts()
          }}
          tags={tags}
        />
      )}
    </div>
  )
}

const NewPostModal = ({ onClose, onSuccess, tags }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tag_ids: []
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiClient.post('/api/forum', formData)
      onSuccess()
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Ask a Question</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="What's your question?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Details *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
              placeholder="Provide more details about your question..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.tag_ids.includes(tag.id)
                      ? 'text-white'
                      : 'bg-muted text-text-secondary hover:bg-muted/70'
                  }`}
                  style={{ backgroundColor: formData.tag_ids.includes(tag.id) ? tag.color : undefined }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-border text-text-primary rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DiscussionForum
