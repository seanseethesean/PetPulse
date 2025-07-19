import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import PetJournal from './Journal';

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'test-user-id' }
  })
}));

jest.mock('../utils/journal', () => ({
  getEntries: jest.fn(() => Promise.resolve({ success: true, entries: [] }))
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        pets: [
          { id: 1, petName: 'Buddy' },
          { id: 2, petName: 'Fluffy' }
        ]
      })
  })
);

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('PetJournal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders title and loads pets', async () => {
    renderWithRouter(<PetJournal />);

    // Avoid multiple match error by getting the heading specifically
    const heading = screen.getByRole('heading', { name: 'Pet Journal' });
    expect(heading).toBeInTheDocument();

    expect(screen.getByText('Select Pet:')).toBeInTheDocument();
    expect(screen.getByText('Choose a pet...')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/pets?userId=test-user-id'
      );
    });
  });
});