import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SocialPage from './SocialPage';
import { BrowserRouter } from 'react-router-dom';

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: {
      uid: 'test-user-id',
      email: 'testuser@example.com'
    }
  })
}));

const mockCreateForumPost = jest.fn(() => Promise.resolve({ success: true, postId: 'post123' }));

jest.mock('../utils/social', () => ({
  getForumPosts: () => Promise.resolve({ success: true, posts: [] }),
  createForumPost: (...args) => mockCreateForumPost(...args)
}));

describe('SocialPage (simple)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Social Hub and switches to forum tab', async () => {
    render(
      <BrowserRouter>
        <SocialPage />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Social Hub/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Community Forum/i));
    expect(screen.getByText(/\+ New Post/i)).toBeInTheDocument();
  });

  test('creates a new forum post', async () => {
    render(
      <BrowserRouter>
        <SocialPage />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText(/Community Forum/i));
    fireEvent.click(screen.getByText(/\+ New Post/i));

    fireEvent.change(screen.getByPlaceholderText(/Post title.../i), {
      target: { value: 'Hello world' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Share your thoughts/i), {
      target: { value: 'This is a test post.' }
    });

    fireEvent.click(screen.getByText(/Post to Forum/i));

    await waitFor(() => {
      expect(mockCreateForumPost).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'test-user-id',
        title: 'Hello world',
        content: 'This is a test post.',
        category: 'general'
      }));
    });
  });
});