import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/apiClient'

const ForumPostDetail = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [answers, setAnswers] = useState([])
  const [userVotes, setUserVotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [newAnswer, setNewAnswer] = useState('')
  const [submittingAnswer, setSubmittingAnswer] = useState(false)

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
    fetchPostDetails()
  }, [postId])

  const fetchPostDetails = async () => {
    try {
      setLoading(true)
      console.log('Fetching post details for:', postId)
      const response = await apiClient.get(`/api/forum/${postId}`)
      console.log('Post details response:', response.data)
      setPost(response.data.post)
      setAnswers(response.data.answers)
      setUserVotes(response.data.user_votes || {})
    } catch (error) {
      console.error('Failed to fetch post details:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      if (error.response?.status === 404) {
        navigate('/forum')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (targetType, targetId, voteType) => {
    try {
      console.log('Voting:', targetType, targetId, voteType)
      console.log('Current user:', user)
      
      const endpoint = targetType === 'post' 
        ? `/api/forum/${postId}/vote`
        : `/api/forum/answers/${targetId}/vote`
      
      console.log('Vote endpoint:', endpoint)
      
      const response = await apiClient.post(endpoint, { vote_type: voteType })
      console.log('Vote response:', response.data)
      
      // Refresh data to get updated vote counts
      fetchPostDetails()
    } catch (error) {
      console.error('Failed to vote:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      alert('Failed to vote')
    }
  }

  const handlePostAnswer = async (e) => {
    e.preventDefault()
    if (!newAnswer.trim()) return

    setSubmittingAnswer(true)
    try {
      await apiClient.post(`/api/forum/${postId}/answers`, {
        content: newAnswer
      })
      
      setNewAnswer('')
      setShowAnswerForm(false)
      fetchPostDetails()
    } catch (error) {
      console.error('Failed to post answer:', error)
      alert('Failed to post answer')
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const handleMarkBestAnswer = async (answerId) => {
    try {
      await apiClient.post(`/api/forum/answers/${answerId}/best`)
      fetchPostDetails()
    } catch (error) {
      console.error('Failed to mark best answer:', error)
      alert('Failed to mark best answer')
    }
  }

  const handleUnmarkBestAnswer = async (answerId) => {
    try {
      await apiClient.delete(`/api/forum/answers/${answerId}/best`)
      fetchPostDetails()
    } catch (error) {
      console.error('Failed to unmark best answer:', error)
      alert('Failed to unmark best answer')
    }
  }

  const getVoteStatus = (targetType, targetId) => {
    const key = targetType === 'post' ? (targetId, null) : (null, targetId)
    return userVotes[key] || null
  }

  const getVoteScore = (item) => {
    return item.upvote_count - item.downvote_count
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-text-secondary">Loading post...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-text-secondary">Post not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/forum')}
          className="mb-6 text-primary hover:underline flex items-center gap-2"
        >
          ← Back to Forum
        </button>

        {/* Post */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-text-primary">{post.title}</h1>
            
            {/* Vote Buttons */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => handleVote('post', post.id, 'upvote')}
                className={`p-1 rounded transition-colors ${
                  getVoteStatus('post', post.id) === 'upvote'
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                ▲
              </button>
              <span className="text-sm font-medium text-text-primary">
                {getVoteScore(post)}
              </span>
              <button
                onClick={() => handleVote('post', post.id, 'downvote')}
                className={`p-1 rounded transition-colors ${
                  getVoteStatus('post', post.id) === 'downvote'
                    ? 'text-red-500 bg-red-50'
                    : 'text-text-secondary hover:text-red-500'
                }`}
              >
                ▼
              </button>
            </div>
          </div>

          <div className="prose max-w-none mb-4">
            <p className="text-text-secondary whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Post Meta */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span>👤 {post.author_name}</span>
              <span>🎓 {post.author_role}</span>
              <span>📅 {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              <span>👁️ {post.views} views</span>
            </div>
            
            {post.is_closed && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Closed
              </span>
            )}
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            
            {!post.is_closed && (
              <button
                onClick={() => setShowAnswerForm(!showAnswerForm)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                {showAnswerForm ? 'Cancel' : 'Add Answer'}
              </button>
            )}
          </div>

          {/* Answer Form */}
          {showAnswerForm && (
            <form onSubmit={handlePostAnswer} className="mb-6 p-4 bg-muted rounded-lg">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-4 py-2 border border-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none mb-4"
                placeholder="Write your answer..."
                required
              />
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAnswerForm(false)}
                  className="px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAnswer}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
                >
                  {submittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          )}

          {/* Answers List */}
          {answers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💭</div>
              <p className="text-text-secondary">No answers yet. Be the first to answer!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {answers.map(answer => (
                <div
                  key={answer.id}
                  className={`p-4 rounded-lg border ${
                    answer.is_best_answer
                      ? 'border-green-500 bg-green-50'
                      : 'border-border bg-muted/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="prose max-w-none mb-3">
                        <p className="text-text-secondary whitespace-pre-wrap">{answer.content}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span>👤 {answer.author_name}</span>
                          <span>🎓 {answer.author_role}</span>
                          <span>📅 {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Best Answer Controls */}
                          {post.author_id === user.id && (
                            <button
                              onClick={() => answer.is_best_answer 
                                ? handleUnmarkBestAnswer(answer.id)
                                : handleMarkBestAnswer(answer.id)
                              }
                              className={`px-3 py-1 rounded text-xs transition-colors ${
                                answer.is_best_answer
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-muted text-text-secondary hover:bg-muted/70'
                              }`}
                            >
                              {answer.is_best_answer ? '✓ Best Answer' : 'Mark as Best'}
                            </button>
                          )}

                          {/* Vote Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleVote('answer', answer.id, 'upvote')}
                              className={`p-1 rounded transition-colors ${
                                getVoteStatus('answer', answer.id) === 'upvote'
                                  ? 'text-primary bg-primary/10'
                                  : 'text-text-secondary hover:text-primary'
                              }`}
                            >
                              ▲
                            </button>
                            <span className="text-sm font-medium text-text-primary">
                              {getVoteScore(answer)}
                            </span>
                            <button
                              onClick={() => handleVote('answer', answer.id, 'downvote')}
                              className={`p-1 rounded transition-colors ${
                                getVoteStatus('answer', answer.id) === 'downvote'
                                  ? 'text-red-500 bg-red-50'
                                  : 'text-text-secondary hover:text-red-500'
                              }`}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {answer.is_best_answer && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <span className="text-green-600 text-sm font-medium">✓ Best Answer</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForumPostDetail
