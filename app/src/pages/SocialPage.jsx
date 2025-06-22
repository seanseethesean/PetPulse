import { useEffect, useState } from "react";
import "../assets/SocialPage.css";
import { getAuth } from "firebase/auth";
import Navbar from "../components/Navbar";

// Icons - you can replace with your actual icons
const search_icon = "🔎"; 
const user_icon = "👤";
const chat_icon = "💬";
const follow_icon = "👋";

const SocialPage = () => {
  const [activeTab, setActiveTab] = useState("search") // search, following, followers, chat
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [chatUsers, setChatUsers] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      setCurrentUser(user)
      fetchUserData()
    }
  }, [])

  const fetchUserData = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    try {
      // Fetch following list
      const followingRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/social/following?userId=${user.uid}`
      )
      const followingData = await followingRes.json()
      if (followingData.success) {
        setFollowing(followingData.following || [])
      }

      // Fetch followers list
      const followersRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/social/followers?userId=${user.uid}`
      )
      const followersData = await followersRes.json()
      if (followersData.success) {
        setFollowers(followersData.followers || [])
      }

      // Fetch chat users (people you're following or who follow you)
      const chatUsersRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/social/chat-users?userId=${user.uid}`
      )
      const chatUsersData = await chatUsersRes.json()
      if (chatUsersData.success) {
        setChatUsers(chatUsersData.users || [])
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    const auth = getAuth()
    const user = auth.currentUser

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/social/search?query=${encodeURIComponent(searchQuery)}&userId=${user.uid}`
      )
      const data = await response.json()
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
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/social/${isFollowing ? 'unfollow' : 'follow'}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: user.uid,
            targetUserId: targetUserId
          })
        }
      )

      const result = await response.json()
      if (result.success) {
        // Update local state
        if (isFollowing) {
          setFollowing(prev => prev.filter(f => f.id !== targetUserId))
        } else {
          // Refetch to get updated data
          fetchUserData()
        }
        
        // Update search results
        setSearchResults(prev => prev.map(user => 
          user.id === targetUserId 
            ? { ...user, isFollowing: !isFollowing }
            : user
        ))
      }
    } catch (err) {
      console.error("Error following/unfollowing user:", err)
    }
  }

  const handleStartChat = (user) => {
    setSelectedChat(user)
    setActiveTab("chat")
    fetchMessages(user.id)
  }

  const fetchMessages = async (otherUserId) => {
    const auth = getAuth()
    const user = auth.currentUser

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/social/messages?userId=${user.uid}&otherUserId=${otherUserId}`
      )
      const data = await response.json()
      if (data.success) {
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error("Error fetching messages:", err)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    const auth = getAuth()
    const user = auth.currentUser

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/social/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            senderId: user.uid,
            receiverId: selectedChat.id,
            content: newMessage,
            timestamp: new Date().toISOString()
          })
        }
      )

      const result = await response.json()
      if (result.success) {
        setMessages(prev => [...prev, {
          id: result.messageId,
          senderId: user.uid,
          receiverId: selectedChat.id,
          content: newMessage,
          timestamp: new Date().toISOString(),
          senderName: user.displayName || user.email
        }])
        setNewMessage("")
      }
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  const renderUserCard = (user, showFollowButton = true, showChatButton = false) => (
    <div key={user.id} className="user-card">
      <div className="user-avatar">
        <img src={user.profilePicture || user_icon} alt={user.displayName} />
      </div>
      <div className="user-info">
        <h4>{user.displayName || user.email}</h4>
        <p>{user.bio || "Pet lover"}</p>
        {user.petCount && <span className="pet-count">{user.petCount} pets</span>}
      </div>
      <div className="user-actions">
        {showFollowButton && (
          <button
            className={`follow-btn ${user.isFollowing ? 'following' : ''}`}
            onClick={() => handleFollow(user.id, user.isFollowing)}
          >
            {user.isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
        {showChatButton && (
          <button
            className="chat-btn"
            onClick={() => handleStartChat(user)}
          >
            Chat
          </button>
        )}
      </div>
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
          className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          {search_icon} Search Users
        </button>
        <button
          className={`nav-tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          {follow_icon} Following ({following.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          {user_icon} Followers ({followers.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          {chat_icon} Messages
        </button>
      </div>

      {/* Content Area */}
      <div className="social-content">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search for users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
              
              {searchResults.map(user => renderUserCard(user, true, false))}
            </div>
          </div>
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <div className="following-section">
            <h3>People You Follow</h3>
            {following.length === 0 ? (
              <div className="empty-state">
                <p>You're not following anyone yet. Start by searching for users!</p>
              </div>
            ) : (
              <div className="users-grid">
                {following.map(user => renderUserCard(user, true, true))}
              </div>
            )}
          </div>
        )}

        {/* Followers Tab */}
        {activeTab === 'followers' && (
          <div className="followers-section">
            <h3>Your Followers</h3>
            {followers.length === 0 ? (
              <div className="empty-state">
                <p>No followers yet. Share your profile to get more followers!</p>
              </div>
            ) : (
              <div className="users-grid">
                {followers.map(user => renderUserCard(user, true, true))}
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="chat-section">
            {!selectedChat ? (
              <div className="chat-users-list">
                <h3>Select a user to chat with</h3>
                {chatUsers.length === 0 ? (
                  <div className="empty-state">
                    <p>No chat contacts yet. Follow someone to start chatting!</p>
                  </div>
                ) : (
                  <div className="chat-users">
                    {chatUsers.map(user => (
                      <div
                        key={user.id}
                        className="chat-user-item"
                        onClick={() => handleStartChat(user)}
                      >
                        <img src={user.profilePicture || user_icon} alt={user.displayName} />
                        <div className="chat-user-info">
                          <h4>{user.displayName || user.email}</h4>
                          <p>{user.lastMessage || "Start a conversation"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="chat-window">
                <div className="chat-header">
                  <button
                    className="back-btn"
                    onClick={() => setSelectedChat(null)}
                  >
                    ← Back
                  </button>
                  <div className="chat-user-info">
                    <img src={selectedChat.profilePicture || user_icon} alt={selectedChat.displayName} />
                    <h4>{selectedChat.displayName || selectedChat.email}</h4>
                  </div>
                </div>

                <div className="messages-container">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`message ${message.senderId === currentUser?.uid ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        {message.content}
                      </div>
                      <div className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="message-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage}>Send</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SocialPage