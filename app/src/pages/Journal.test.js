import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import PetJournal from './Journal';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'test-user-id' }
  })
}));

// Mock journal entry fetch
jest.mock('../utils/journal', () => ({
  getEntries: jest.fn(() => Promise.resolve({ success: true, entries: [] }))
}));

// Global fetch mock for any environment (local, Render, CI)
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/pets') && url.includes('userId=test-user-id')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            pets: [
              { id: 1, petName: 'Buddy' },
              { id: 2, petName: 'Fluffy' }
            ]
          })
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('PetJournal', () => {
  test('renders title and loads pets', async () => {
    renderWithRouter(<PetJournal />);

    expect(screen.getByRole('heading', { name: 'Pet Journal' })).toBeInTheDocument();
    expect(screen.getByText('Select Pet:')).toBeInTheDocument();
    expect(screen.getByText('Choose a pet...')).toBeInTheDocument();

    // Wait for pets to be fetched and rendered
    expect(await screen.findByText('Buddy')).toBeInTheDocument();
    expect(await screen.findByText('Fluffy')).toBeInTheDocument();

    // Confirm fetch was called with correct URL pattern
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pets?userId=test-user-id')
      );
    });
  });
});