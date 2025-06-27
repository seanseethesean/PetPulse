import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SocialPage from './SocialPage';
import { BrowserRouter } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

// 🔧 Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: {
      uid: 'test-user-id',
      email: 'testuser@example.com'
    }
  })
}));

// 🔧 Mock SocialService
const mockSearchUsers = jest.fn(() => Promise.resolve({
  success: true,
  users: [
    { id: '2', email: 'other@example.com', displayName: 'Other User', isFollowing: false, petCount: 2 }
  ]
}));
const mockGetFollowing = jest.fn(() => Promise.resolve({ success: true, following: [] }));
const mockGetFollowers = jest.fn(() => Promise.resolve({ success: true, followers: [] }));
const mockGetForumPosts = jest.fn(() => Promise.resolve({ success: true, posts: [] }));
const mockFollowUser = jest.fn(() => Promise.resolve({ success: true }));
const mockUnfollowUser = jest.fn(() => Promise.resolve({ success: true }));
const mockCreateForumPost = jest.fn(() => Promise.resolve({ success: true, postId: 'post123' }));

jest.mock('../utils/social', () => ({
  searchUsers: (...args) => mockSearchUsers(...args),
  getFollowing: (...args) => mockGetFollowing(...args),
  getFollowers: (...args) => mockGetFollowers(...args),
  getForumPosts: (...args) => mockGetForumPosts(...args),
  followUser: (...args) => mockFollowUser(...args),
  unfollowUser: (...args) => mockUnfollowUser(...args),
  createForumPost: (...args) => mockCreateForumPost(...args),
  likePost: jest.fn(() => Promise.resolve({ success: true })),
  addComment: jest.fn(() => Promise.resolve({ success: true, commentId: 'comment123' })),
}));

describe('SocialPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders and switches to "Search Users" tab', async () => {
    render(
      <BrowserRouter>
        <SocialPage />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Social Hub/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Search Users/i));
    expect(screen.getByPlaceholderText(/Search for users/i)).toBeInTheDocument();
  });

  test('searches and displays user results', async () => {
    render(
      <BrowserRouter>
        <SocialPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Search for users/i), {
      target: { value: 'other@example.com' }
    });

    fireEvent.click(screen.getByText(/Search/i));

    expect(await screen.findByText(/Other User/i)).toBeInTheDocument();
    expect(screen.getByText(/Follow/i)).toBeInTheDocument();
  });

  test('follows a user from search results', async () => {
    render(
      <BrowserRouter>
        <SocialPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Search for users/i), {
      target: { value: 'other@example.com' }
    });

    fireEvent.click(screen.getByText(/Search/i));

    const followBtn = await screen.findByText(/Follow/i);
    fireEvent.click(followBtn);

    await waitFor(() => {
      expect(mockFollowUser).toHaveBeenCalledWith('test-user-id', '2');
    });
  });

  test('creates a new forum post', async () => {
    render(
      <BrowserRouter>
        <SocialPage />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText(/Community Forum/i));
    fireEvent.click(await screen.findByText(/\+ New Post/i));

    fireEvent.change(screen.getByPlaceholderText(/Post title.../i), {
      target: { value: 'My Pet Story' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Share your thoughts/i), {
      target: { value: 'This is about my dog Max!' }
    });

    fireEvent.click(screen.getByText(/Post to Forum/i));

    await waitFor(() => {
      expect(mockCreateForumPost).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'test-user-id',
        title: 'My Pet Story',
        content: 'This is about my dog Max!',
        category: 'general'
      }));
    });
  });
});