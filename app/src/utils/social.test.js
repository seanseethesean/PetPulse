import SocialService from "./social"

const mockUrl = "https://mockapi.com"
process.env.REACT_APP_API_URL = mockUrl

global.fetch = jest.fn()

describe("SocialService", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockSuccess = (data) => ({
    ok: true,
    json: async () => data,
  })

  const mockFailure = (message = "Error") => ({
    ok: false,
    json: async () => ({ error: message }),
  })

  it("gets followers", async () => {
    fetch.mockResolvedValueOnce(mockSuccess([{ id: "1" }]))
    const res = await SocialService.getFollowers("user1")
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/followers?userId=user1`)
    expect(res[0].id).toBe("1")
  })

  it("gets following", async () => {
    fetch.mockResolvedValueOnce(mockSuccess([{ id: "2" }]))
    const res = await SocialService.getFollowing("user1")
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/following?userId=user1`)
    expect(res[0].id).toBe("2")
  })

  it("searches users", async () => {
    fetch.mockResolvedValueOnce(mockSuccess([{ name: "Alice" }]))
    const res = await SocialService.searchUsers("al", "user1")
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/search?query=al&userId=user1`)
    expect(res[0].name).toBe("Alice")
  })

  it("follows a user", async () => {
    fetch.mockResolvedValueOnce(mockSuccess({ success: true }))
    const res = await SocialService.followUser("user1", "user2")
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/follow`, expect.any(Object))
    expect(res.success).toBe(true)
  })

  it("unfollows a user", async () => {
    fetch.mockResolvedValueOnce(mockSuccess({ success: true }))
    const res = await SocialService.unfollowUser("user1", "user2")
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/unfollow`, expect.any(Object))
    expect(res.success).toBe(true)
  })

  it("gets forum posts", async () => {
    fetch.mockResolvedValueOnce(mockSuccess([{ postId: 1 }]))
    const res = await SocialService.getForumPosts("user1")
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/forum/posts?userId=user1`)
    expect(res[0].postId).toBe(1)
  })

  it("creates forum post", async () => {
    fetch.mockResolvedValueOnce(mockSuccess({ postId: 99 }))
    const res = await SocialService.createForumPost({ title: "hi" })
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/forum/posts`, expect.any(Object))
    expect(res.postId).toBe(99)
  })

  it("likes post", async () => {
    fetch.mockResolvedValueOnce(mockSuccess({ likes: 5 }))
    const res = await SocialService.likePost("post123", "user1", true)
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/forum/posts/post123/like`, expect.any(Object))
    expect(res.likes).toBe(5)
  })

  it("adds comment", async () => {
    fetch.mockResolvedValueOnce(mockSuccess({ commentId: 9 }))
    const res = await SocialService.addComment("post123", { text: "hello" })
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/forum/posts/post123/comments`, expect.any(Object))
    expect(res.commentId).toBe(9)
  })

  it("gets comments", async () => {
    fetch.mockResolvedValueOnce(mockSuccess([{ text: "yo" }]))
    const res = await SocialService.getCommentsForPost("post123")
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/forum/posts/post123/comments`)
    expect(res[0].text).toBe("yo")
  })

  it("throws error if !ok response with JSON error", async () => {
    fetch.mockResolvedValueOnce(mockFailure("Fail reason"))
    await expect(SocialService.getFollowers("bad")).rejects.toThrow("Fail reason")
  })

  it("throws generic error if JSON parse fails", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new Error("broken") }
    })
    await expect(SocialService.getFollowers("fail")).rejects.toThrow("Network error")
  })
  
  describe("Chat Features", () => {
    beforeEach(() => {
      fetch.mockReset();
    });
  
    it("getChatId returns consistent ID regardless of user order", () => {
      const id1 = SocialService.getChatId("a", "b");
      const id2 = SocialService.getChatId("b", "a");
      expect(id1).toBe(id2);
      expect(id1).toBe("a_b");
    });
  
    it("getMessages calls correct endpoint and returns parsed response", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, messages: ["hi", "yo"] })
      });
  
      const res = await SocialService.getMessages("a_b");
      expect(fetch).toHaveBeenCalledWith("https://mockapi.com/api/chats/a_b");
      expect(res).toEqual({ success: true, messages: ["hi", "yo"] });
    });
  
    it("sendMessage calls POST endpoint and returns success", async () => {
      const msg = { content: "hi", senderId: "a", receiverId: "b" };
  
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });
  
      const res = await SocialService.sendMessage("a_b", msg);
      expect(fetch).toHaveBeenCalledWith("https://mockapi.com/api/chats/a_b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg)
      });
      expect(res).toEqual({ success: true });
    });
  });
})
