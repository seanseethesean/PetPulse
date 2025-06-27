import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock the authService used in Login.jsx
jest.mock('../utils/auth.js', () => ({
  login: jest.fn(() => Promise.resolve()),
  signup: jest.fn(() => Promise.resolve()),
  verifyGoogleToken: jest.fn(() => Promise.resolve()),
}));

// Mock firebase auth functions
jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(() => Promise.resolve({
    user: { getIdToken: () => Promise.resolve('fake-token') }
  }))
}));

describe('Login Page', () => {
  test('renders email and password fields', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('toggles between Sign Up and Login actions', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);

    const signUpTab = screen.getByText('Sign Up');
    const loginTab = screen.getByText('Login');

    // Initially should show "Sign Up"
    expect(screen.getByText('Sign Up')).toBeInTheDocument();

    fireEvent.click(loginTab);
    expect(screen.getByText('Login')).toBeInTheDocument();

    fireEvent.click(signUpTab);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('shows error on failed Google sign in', async () => {
    // Override mock to reject
    const { signInWithPopup } = require('firebase/auth');
    signInWithPopup.mockImplementationOnce(() => Promise.reject(new Error('Google error')));

    render(<BrowserRouter><Login /></BrowserRouter>);

    fireEvent.click(screen.getByText(/sign in with google/i));

    await waitFor(() =>
      expect(screen.getByText(/Google error/i)).toBeInTheDocument()
    );
  });
});