import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user-id' },
  })),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(() => Promise.reject(new Error('Google error')))
}));

describe('Login Page', () => {
  const renderLogin = () =>
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

  test('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('toggles between Sign Up and Login actions', () => {
    renderLogin();

    // Use getAllByText since multiple elements contain "Sign Up" and "Login"
    const signUpElements = screen.getAllByText('Sign Up');
    const loginElements = screen.getAllByText('Login');

    expect(signUpElements.length).toBeGreaterThan(0);
    expect(loginElements.length).toBeGreaterThan(0);

    fireEvent.click(loginElements[0]);
  });

  test('shows error on failed Google sign in', async () => {
    renderLogin();

    // Match button by accessible label
    const googleButton = screen.getByRole('button', {
      name: /sign up with google/i
    });
    fireEvent.click(googleButton);

    // You must have logic in your component that displays "Google error" on failure
    await waitFor(() =>
      expect(screen.getByText(/Google error/i)).toBeInTheDocument()
    );
  });
});