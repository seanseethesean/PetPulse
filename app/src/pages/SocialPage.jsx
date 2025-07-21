import { useEffect, useState } from "react"
import "../assets/SocialPage.css"
import { getAuth } from "firebase/auth"
import Navbar from "../components/Navbar"
import SocialService from "../utils/social"

const search_icon = "🔎"
const user_icon = "👤"
const forum_icon = "💭"
const follow_icon = "👋"

const SocialPage = () => {
  const [activeTab, setActiveTab] = useState("search") // search, following, followers, forum
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [forumPosts, setForumPosts] = useState([])
  const [newPost, setNewPost] = useState("")
  const [postTitle, setPostTitle] = useState("")
  const [postCategory, setPostCategory] = useState("general")
  const [selectedPost, setSelectedPost] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)

  const categories = [
    { value: "general", label: "General Discussion" },
    { value: "advice", label: "Advice & Tips" },
    { value: "health", label: "Pet Health" },
    { value: "training", label: "Training & Behaviour" },
    { value: "photos", label: "Pet Photos & Stories" },
    { value: "recommendations", label: "Product Recommendations" }
  ]

  useEffect(() => {
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      setCurrentUser(user)
      fetchUserData(user.uid)
      fetchForumPosts(user.uid)
    }
  }, [])

  const fetchUserData = async (userId) => {
    try {
      // Fetch following list
      const followingData = await SocialService.getFollowing(userId)
      if (followingData.success) {
        setFollowing(followingData.following || [])
      }

      // Fetch followers list
      const followersData = await SocialService.getFollowers(userId)
      if (followersData.success) {
        setFollowers(followersData.followers || [])
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }

  const fetchForumPosts = async (userId) => {
    try {
      const data = await SocialService.getForumPosts(userId)

      if (data.success) {
        const postsWithComments = await Promise.all(
          (data.posts || []).map(async (post) => {
            const response = await SocialService.getCommentsForPost(post.id)
            const comments = response.comments || []
            return {
              ...post,
              comments: comments || []
            }
          })
        )

        setForumPosts(postsWithComments)
      }
    } catch (err) {
      console.error("Error fetching forum posts:", err)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    const auth = getAuth()
    const user = auth.currentUser

    try {
      const data = await SocialService.searchUsers(searchQuery, user.uid)
      if (data.success) {
        setSearchResults(data.users || [])
      }
    } catch (err) {
      console.error("Error searching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (targetUserId, isFollowing) => {
    const auth = getAuth()
    const user = auth.currentUser

    try {
      const result = isFollowing
        ? await SocialService.unfollowUser(user.uid, targetUserId)
        : await SocialService.followUser(user.uid, targetUserId)

      if (result.success) {
        // Update local state
        if (isFollowing) {
          setFollowing((prev) => prev.filter((f) => f.id !== targetUserId))
        } else {
          // Refetch to get updated data
          fetchUserData(user.uid)
        }

        // Update search results
        setSearchResults((prev) =>
          prev.map((user) =>
            user.id === targetUserId
              ? { ...user, isFollowing: !isFollowing }
              : user
          )
        )
      }
    } catch (err) {
      console.error("Error following/unfollowing user:", err)
    }
  }

  const createForumPost = async () => {
    if (!newPost.trim() || !postTitle.trim()) return

    const auth = getAuth()
    const user = auth.currentUser
    setLoading(true)
    const postData = {
      userId: user.uid,
      userEmail: user.email,
      title: postTitle,
      category: postCategory,
      content: newPost,
      createdAt: new Date().toISOString()
    }

    try {
      const result = await SocialService.createForumPost(postData)
      if (result.success) {
        // Add new post to the beginning of the list
        setForumPosts((prev) => [
          {
            id: result.postId,
            ...postData,
            likes: 0,
            comments: [],
            isLiked: false
          },
          ...prev
        ])
        setNewPost("")
        setPostTitle("")
        setPostCategory("general")
        setShowCreatePost(false)
      }
    } catch (err) {
      console.error("Error creating forum post:", err)
    } finally {
      setLoading(false)
    }
  }

  const likePost = async (postId, isLiked) => {
    const auth = getAuth()
    const user = auth.currentUser

    try {
      const result = await SocialService.likePost(postId, user.uid, !isLiked)
      if (result.success) {
        setForumPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !isLiked,
                  likes: isLiked ? post.likes - 1 : post.likes + 1
                }
              : post
          )
        )
      }
    } catch (err) {
      console.error("Error liking post:", err)
    }
  }

  const addComment = async (postId) => {
    if (!newComment.trim()) return

    const auth = getAuth()
    const user = auth.currentUser
    const commentData = {
      userId: user.uid,
      userEmail: user.email,
      content: newComment,
      timestamp: new Date().toISOString()
    }

    try {
      const result = await SocialService.addComment(postId, commentData)
      if (result.success) {
        const newCommentEntry = { id: result.commentId, ...commentData }
        setForumPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...(post.comments || []), newCommentEntry]
                }
              : post
          )
        )
        if (selectedPost?.id === postId) {
          setSelectedPost((prev) => ({
            ...prev,
            comments: [...(prev.comments || []), newCommentEntry]
          }))
        }
        setNewComment("")
      }
    } catch (err) {
      console.error("Error adding comment:", err)
    }
  }

  const renderUserCard = (
    user,
    showFollowButton = true
  ) => (
    <div key={user.id} className="user-card">
      <div className="user-avatar"></div>
      <div className="user-info">
        <h4>{user.displayName || user.email}</h4>
        <p>{user.bio || "Pet lover"}</p>
        {/* {user.petCount && (
          <span className="pet-count">{user.petCount} pets</span>
        )} */}
      </div>
      <div className="user-actions">
        {showFollowButton && (
          <button
            className={`follow-btn ${user.isFollowing ? "following" : ""}`}
            onClick={() => handleFollow(user.id, user.isFollowing)}>
            {user.isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>
    </div>
  )

  const renderForumPost = (post) => (
    <div key={post.id} className="forum-post">
      <div className="post-header">
        <div className="post-user">
          <div className="user-info">
            <h4>{post.userName}</h4>
            <span className="post-time">
              {post.userEmail?.split("@")[0]} at{" "}
              {new Date(post.createdAt).toLocaleDateString("en-SG", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
              ,{" "}
              {new Date(post.createdAt).toLocaleTimeString("en-SG", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        </div>
        <div className="post-category">
          <span className={`category-tag category-${post.category}`}>
            {categories.find((cat) => cat.value === post.category)?.label ||
              post.category}
          </span>
        </div>
      </div>
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">{post.content}</p>
      </div>
      <div className="post-actions">
        <button
          className={`like-btn ${post.isLiked ? "liked" : ""}`}
          onClick={() => likePost(post.id, post.isLiked)}>
          ❤️ {post.likes || 0}
        </button>
        <button
          className="comment-btn"
          onClick={() =>
            setSelectedPost(selectedPost?.id === post.id ? null : post)
          }>
          💬 {post.comments?.length || 0} Comments
        </button>
      </div>
      
      {selectedPost?.id === post.id && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-content">
                  <div className="comment-header">
                    <h5>{comment.userName}</h5>
                    <span className="comment-time">
                      {comment.userEmail?.split("@")[0]} at{" "}
                      {new Date(comment.timestamp).toLocaleDateString("en-SG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                      ,{" "}
                      {new Date(comment.timestamp).toLocaleTimeString("en-SG", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="add-comment">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
            />
            <button onClick={() => addComment(post.id)}>Post</button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="social-page-container">
      <Navbar />
      {/* Header */}
      <div className="social-header">
        <h1>Social Hub</h1>
        <div className="social-stats">
          <span>{following.length} Following</span>
          <span>{followers.length} Followers</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="social-nav">
        <button
          className={`nav-tab ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}>
          {search_icon} Search Users
        </button>
        <button
          className={`nav-tab ${activeTab === "following" ? "active" : ""}`}
          onClick={() => setActiveTab("following")}>
          {follow_icon} Following ({following.length})
        </button>
        <button
          className={`nav-tab ${activeTab === "followers" ? "active" : ""}`}
          onClick={() => setActiveTab("followers")}>
          {user_icon} Followers ({followers.length})
        </button>
        <button
          className={`nav-tab ${activeTab === "forum" ? "active" : ""}`}
          onClick={() => setActiveTab("forum")}>
          {forum_icon} Community Forum
        </button>
      </div>

      {/* Content Area */}
      <div className="social-content">
        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search for users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onDoubleClick={(e) => e.key === "Enter" && handleSearch()}
              />
              <button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="search-results">
              {searchResults.length === 0 && searchQuery && !loading && (
                <div className="no-results">
                  <p>No users found matching "{searchQuery}"</p>
                </div>
              )}

              {searchResults.map((user) => renderUserCard(user, true, false))}
            </div>
          </div>
        )}

        {/* Following Tab */}
        {activeTab === "following" && (
          <div className="following-section">
            <h3>People You Follow</h3>
            {following.length === 0 ? (
              <div className="empty-state">
                <p>
                  You're not following anyone yet. Start by searching for users!
                </p>
              </div>
            ) : (
              <div className="users-grid">
                {following.map((user) => renderUserCard(user, true, false))}
              </div>
            )}
          </div>
        )}

        {/* Followers Tab */}
        {activeTab === "followers" && (
          <div className="followers-section">
            <h3>Your Followers</h3>
            {followers.length === 0 ? (
              <div className="empty-state">
                <p>
                  No followers yet. Share your profile to get more followers!
                </p>
              </div>
            ) : (
              <div className="users-grid">
                {followers.map((user) => renderUserCard(user, true, false))}
              </div>
            )}
          </div>
        )}

        {/* Forum Tab */}
        {activeTab === "forum" && (
          <div className="forum-section">
            <div className="forum-header">
              <h3>Community Forum</h3>
              <button
                className="create-post-btn"
                onClick={() => setShowCreatePost(!showCreatePost)}>
                {showCreatePost ? "Cancel" : "+ New Post"}
              </button>
            </div>

            {showCreatePost && (
              <div className="create-post-form">
                <input
                  type="text"
                  placeholder="Post title..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="post-title-input"
                />

                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="category-select">
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                <textarea
                  placeholder="Share your thoughts, ask for advice, or start a discussion..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="post-content-input"
                  rows="4"
                />

                <div className="post-form-actions">
                  <button
                    onClick={createForumPost}
                    disabled={loading || !postTitle.trim() || !newPost.trim()}
                    className="submit-post-btn">
                    {loading ? "Posting..." : "Post to Forum"}
                  </button>
                </div>
              </div>
            )}

            <div className="forum-posts">
              {forumPosts.length === 0 ? (
                <div className="empty-state">
                  <p>No posts yet. Be the first to start a discussion!</p>
                </div>
              ) : (
                forumPosts.map((post) => renderForumPost(post))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SocialPage