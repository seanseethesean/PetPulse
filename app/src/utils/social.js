const URL = process.env.REACT_APP_API_URL;

class SocialService {
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getFollowers(userId) {
    const res = await fetch(`${URL}/api/users/followers?userId=${userId}`);
    return await this.handleResponse(res);
  }

  async getFollowing(userId) {
    const res = await fetch(`${URL}/api/users/following?userId=${userId}`);
    return await this.handleResponse(res);
  }

  async searchUsers(query, userId) {
    const res = await fetch(`${URL}/api/users/search?query=${encodeURIComponent(query)}&userId=${userId}`);
    return await this.handleResponse(res);
  }

  async followUser(userId, targetUserId) {
    const res = await fetch(`${URL}/api/users/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, targetUserId })
    });
    return await this.handleResponse(res);
  }

  async unfollowUser(userId, targetUserId) {
    const res = await fetch(`${URL}/api/users/unfollow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, targetUserId })
    });
    return await this.handleResponse(res);
  }

  async getForumPosts(userId) {
    const res = await fetch(`${URL}/api/forum/posts?userId=${userId}`);
    return await this.handleResponse(res);
  }

  async createForumPost(postData) {
    const res = await fetch(`${URL}/api/forum/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData)
    });
    return await this.handleResponse(res);
  }

  async likePost(postId, userId, isLiked) {
    const res = await fetch(`${URL}/api/forum/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isLiked })
    });
    return await this.handleResponse(res);
  }

  async addComment(postId, commentData) {
    const res = await fetch(`${URL}/api/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData)
    });
    return await this.handleResponse(res);
  }

  async getCommentsForPost(postId) {
    const res = await fetch(`${URL}/api/forum/posts/${postId}/comments`);
    return await this.handleResponse(res);
  }
}
export default new SocialService();