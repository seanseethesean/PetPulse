import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import SocialPage from "../pages/SocialPage"
import { BrowserRouter } from "react-router-dom"
import "@testing-library/jest-dom"
import SocialService from "../utils/social"

jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: { uid: "mockUser", email: "mock@example.com" }
  })
}))

jest.mock("../utils/social")

const mockUser = { id: "user1", email: "user1@example.com", isFollowing: false }
const mockFollowing = [{ id: "user2", email: "followed@example.com", isFollowing: true }]
const mockFollowers = [{ id: "user3", email: "follower@example.com" }]
const mockPosts = [
  {
    id: "post1",
    userId: "mockUser",
    userEmail: "mock@example.com",
    userName: "MockUser",
    title: "My Pet Story",
    category: "photos",
    content: "Here’s my pet!",
    createdAt: new Date().toISOString(),
    likes: 2,
    isLiked: false,
    comments: []
  }
]

beforeEach(() => {
  jest.clearAllMocks()
  SocialService.getFollowing.mockResolvedValue({ success: true, following: mockFollowing })
  SocialService.getFollowers.mockResolvedValue({ success: true, followers: mockFollowers })
  SocialService.getForumPosts.mockResolvedValue({ success: true, posts: mockPosts })
  SocialService.getCommentsForPost.mockResolvedValue({ comments: [] })
})

const renderPage = () =>
  render(
    <BrowserRouter>
      <SocialPage />
    </BrowserRouter>
  )

const getSearchTab = () => screen.getByRole("button", { name: /🔎\s+Search Users/i })
const getFollowingTab = () => screen.getByRole("button", { name: /👋\s+Following/i })
const getFollowersTab = () => screen.getByRole("button", { name: /👤\s+Followers/i })
const getForumTab = () => screen.getByRole("button", { name: /💭\s+Community Forum/i })

describe("SocialPage", () => {
  it("renders Social Hub header", async () => {
    renderPage()
    expect(await screen.findByText("Social Hub")).toBeInTheDocument()
  })

  it("switches to Following tab and displays followed users", async () => {
    renderPage()
    fireEvent.click(getFollowingTab())
    expect(await screen.findByText("People You Follow")).toBeInTheDocument()
    expect(await screen.findByText("followed@example.com")).toBeInTheDocument()
  })

  it("switches to Followers tab and displays followers", async () => {
    renderPage()
    fireEvent.click(getFollowersTab())
    expect(await screen.findByText("Your Followers")).toBeInTheDocument()
    expect(await screen.findByText("follower@example.com")).toBeInTheDocument()
  })

  it("switches to Forum tab and displays forum post", async () => {
    renderPage()
    fireEvent.click(getForumTab())
    expect(await screen.findByText("My Pet Story")).toBeInTheDocument()
  })

  it("allows search and shows results", async () => {
    SocialService.searchUsers.mockResolvedValue({ success: true, users: [mockUser] })
    renderPage()

    const input = await screen.findByPlaceholderText(/Search for users/)
    fireEvent.change(input, { target: { value: "user1" } })
    fireEvent.click(screen.getByText("Search"))

    expect(await screen.findByText("user1@example.com")).toBeInTheDocument()
  })

  it("can follow a user from search results", async () => {
    SocialService.searchUsers.mockResolvedValue({ success: true, users: [mockUser] })
    SocialService.followUser.mockResolvedValue({ success: true })

    renderPage()
    fireEvent.click(getSearchTab())

    fireEvent.change(await screen.findByPlaceholderText(/Search for users/), {
      target: { value: "user1" }
    })
    fireEvent.click(screen.getByText("Search"))

    const followBtn = await screen.findByText("Follow")
    fireEvent.click(followBtn)

    await waitFor(() => expect(SocialService.followUser).toHaveBeenCalled())
  })

  it("can create a forum post", async () => {
    SocialService.createForumPost.mockResolvedValue({ success: true, postId: "newPost" })

    renderPage()
    fireEvent.click(getForumTab())
    fireEvent.click(screen.getByText("+ New Post"))

    fireEvent.change(screen.getByPlaceholderText("Post title..."), {
      target: { value: "Test Title" }
    })
    fireEvent.change(screen.getByPlaceholderText(/Share your thoughts/), {
      target: { value: "This is my post" }
    })

    fireEvent.click(screen.getByText("Post to Forum"))
    await waitFor(() =>
      expect(SocialService.createForumPost).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Test Title", content: "This is my post" })
      )
    )
  })

  it("can like a forum post", async () => {
    SocialService.likePost.mockResolvedValue({ success: true })
    renderPage()
    fireEvent.click(getForumTab())
    fireEvent.click(await screen.findByText(/❤️ 2/))
    await waitFor(() => expect(SocialService.likePost).toHaveBeenCalled())
  })

  it("can add a comment to a post", async () => {
    SocialService.addComment.mockResolvedValue({ success: true, commentId: "c1" })
    renderPage()
    fireEvent.click(getForumTab())
    fireEvent.click(await screen.findByText(/💬/))

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "Nice post!" }
    })
    fireEvent.click(screen.getByText("Post"))

    await waitFor(() => expect(SocialService.addComment).toHaveBeenCalled())
  })
  
  it("handles search error gracefully", async () => {
    SocialService.searchUsers.mockRejectedValueOnce(new Error("Network error"))
    renderPage()
  
    fireEvent.click(getSearchTab())
    fireEvent.change(await screen.findByPlaceholderText(/Search for users/), {
      target: { value: "user1" }
    })
    fireEvent.click(screen.getByText("Search"))
  
    await waitFor(() =>
      expect(SocialService.searchUsers).toHaveBeenCalled()
    )
  })
  
  it("unfollows user when isFollowing is true", async () => {
    const followingUser = { id: "user1", email: "user1@example.com", isFollowing: true }
  
    SocialService.searchUsers.mockResolvedValue({ success: true, users: [followingUser] })
    SocialService.unfollowUser.mockResolvedValue({ success: true })
  
    renderPage()
    fireEvent.click(getSearchTab())
  
    fireEvent.change(await screen.findByPlaceholderText(/Search for users/), {
      target: { value: "user1" }
    })
    fireEvent.click(screen.getByText("Search"))
  
    const unfollowBtn = await screen.findByText("Unfollow")
    fireEvent.click(unfollowBtn)
  
    await waitFor(() => expect(SocialService.unfollowUser).toHaveBeenCalled())
  })
  
  it("follows user when isFollowing is false", async () => {
    const newUser = { id: "user2", email: "user2@example.com", isFollowing: false }
  
    SocialService.searchUsers.mockResolvedValue({ success: true, users: [newUser] })
    SocialService.followUser.mockResolvedValue({ success: true })
  
    renderPage()
    fireEvent.click(getSearchTab())
  
    fireEvent.change(await screen.findByPlaceholderText(/Search for users/), {
      target: { value: "user2" }
    })
    fireEvent.click(screen.getByText("Search"))
  
    const followBtn = await screen.findByText("Follow")
    fireEvent.click(followBtn)
  
    await waitFor(() => {
      expect(SocialService.followUser).toHaveBeenCalled()
    })
  })
  
  it("handles follow/unfollow error gracefully", async () => {
    const newUser = { id: "user3", email: "user3@example.com", isFollowing: false }
  
    SocialService.searchUsers.mockResolvedValue({ success: true, users: [newUser] })
    SocialService.followUser.mockRejectedValueOnce(new Error("Follow failed"))
  
    renderPage()
    fireEvent.click(getSearchTab())
  
    fireEvent.change(await screen.findByPlaceholderText(/Search for users/), {
      target: { value: "user3" }
    })
    fireEvent.click(screen.getByText("Search"))
  
    const followBtn = await screen.findByText("Follow")
    fireEvent.click(followBtn)
  
    await waitFor(() => {
      expect(SocialService.followUser).toHaveBeenCalled()
    })
  })
  
  it("handles error when creating a forum post", async () => {
    SocialService.createForumPost.mockRejectedValueOnce(new Error("Failed to create"))
  
    renderPage()
    fireEvent.click(getForumTab())
    fireEvent.click(screen.getByText("+ New Post"))
  
    fireEvent.change(screen.getByPlaceholderText("Post title..."), {
      target: { value: "Bad Post" }
    })
    fireEvent.change(screen.getByPlaceholderText(/Share your thoughts/), {
      target: { value: "Oops" }
    })
  
    fireEvent.click(screen.getByText("Post to Forum"))
    await waitFor(() =>
      expect(SocialService.createForumPost).toHaveBeenCalled()
    )
  })
  
  it("updates post like count correctly", async () => {
    SocialService.likePost.mockResolvedValue({ success: true })
  
    renderPage()
    fireEvent.click(getForumTab())
  
    // initial like count is 2
    fireEvent.click(await screen.findByText(/❤️ 2/))
  
    await waitFor(() => {
      expect(SocialService.likePost).toHaveBeenCalled()
      expect(screen.getByText(/❤️ 3|❤️ 1/)).toBeInTheDocument() // either +1 or -1 depending on `isLiked`
    })
  })
  
  it("handles error when liking a post", async () => {
    SocialService.likePost.mockRejectedValueOnce(new Error("Like failed"))
  
    renderPage()
    fireEvent.click(getForumTab())
    fireEvent.click(await screen.findByText(/❤️ 2/))
  
    await waitFor(() => {
      expect(SocialService.likePost).toHaveBeenCalled()
      // No state change expected, and app doesn't crash
    })
  })
  
  it("toggles create post form when cancel is clicked", async () => {
    renderPage()
    fireEvent.click(getForumTab())
    fireEvent.click(screen.getByText("+ New Post"))
  
    expect(screen.getByPlaceholderText("Post title...")).toBeInTheDocument()
  
    fireEvent.click(screen.getByText("Cancel"))
    expect(screen.queryByPlaceholderText("Post title...")).not.toBeInTheDocument()
  })
  
  it("handles fetchForumPosts error gracefully", async () => {
    SocialService.getForumPosts.mockRejectedValueOnce(new Error("Forum fail"))
  
    renderPage()
    fireEvent.click(getForumTab())
  
    await waitFor(() => {
      expect(SocialService.getForumPosts).toHaveBeenCalled()
    })
  })
  
  it("adds comment and updates forumPosts and selectedPost", async () => {
    const mockComment = {
      commentId: "c123",
      userId: "mockUser",
      userEmail: "mock@example.com",
      content: "Great post!",
      timestamp: new Date().toISOString()
    }
  
    SocialService.addComment.mockResolvedValueOnce({ success: true, commentId: "c123" })
  
    renderPage()
    fireEvent.click(getForumTab())
    fireEvent.click(await screen.findByText(/💬/))
  
    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "Great post!" }
    })
    fireEvent.click(screen.getByText("Post"))
  
    await waitFor(() => {
      expect(SocialService.addComment).toHaveBeenCalled()
      expect(screen.getByText("Great post!")).toBeInTheDocument()
    })
  })
  
})