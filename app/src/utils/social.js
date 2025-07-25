const getURL = () => process.env.REACT_APP_API_URL;

class SocialService {
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getFollowers(userId) {
    const res = await fetch(`${getURL()}/api/followers?userId=${userId}`);
    return await this.handleResponse(res);
  }

  async getFollowing(userId) {
    const res = await fetch(`${getURL()}/api/following?userId=${userId}`);
    return await this.handleResponse(res);
  }

  async searchUsers(query, userId) {
    const res = await fetch(`${getURL()}/api/search?query=${encodeURIComponent(query)}&userId=${userId}`);
    return await this.handleResponse(res);
  }

  async followUser(userId, targetUserId) {
    const res = await fetch(`${getURL()}/api/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, targetUserId })
    });
    return await this.handleResponse(res);
  }

  async unfollowUser(userId, targetUserId) {
    const res = await fetch(`${getURL()}/api/unfollow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, targetUserId })
    });
    return await this.handleResponse(res);
  }

  async getForumPosts(userId) {
    const res = await fetch(`${getURL()}/api/forum/posts?userId=${userId}`);
    return await this.handleResponse(res);
  }

  async createForumPost(postData) {
    const res = await fetch(`${getURL()}/api/forum/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData)
    });
    return await this.handleResponse(res);
  }

  async likePost(postId, userId, isLiked) {
    const res = await fetch(`${getURL()}/api/forum/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isLiked })
    });
    return await this.handleResponse(res);
  }

  async addComment(postId, commentData) {
    const res = await fetch(`${getURL()}/api/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData)
    });
    return await this.handleResponse(res);
  }

  async getCommentsForPost(postId) {
    const res = await fetch(`${getURL()}/api/forum/posts/${postId}/comments`);
    return await this.handleResponse(res);
  }

  getChatId(userA, userB) {
    return [userA, userB].sort().join("_"); // ensures same ID no matter the order
  }
  
  async getMessages(chatId) {
    const res = await fetch(`${getURL()}/api/chats/${chatId}`);
    return await this.handleResponse(res);
  }
  
  async sendMessage(chatId, message) {
    const res = await fetch(`${getURL()}/api/chats/${chatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
    return await this.handleResponse(res);
  }
  
}

export default new SocialService();