import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ExpenseTracker from './ExpenseTracker';
import { getAuth } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'test-user-id' },
    onAuthStateChanged: (callback) => {
      callback({ uid: 'test-user-id' });
      return jest.fn(); // unsubscribe
    }
  })
}));

jest.mock('../utils/expenses', () => ({
  getExpenses: jest.fn(() => Promise.resolve([])),
  createExpense: jest.fn(() => Promise.resolve({ id: 1 })),
  updateExpense: jest.fn(() => Promise.resolve({})),
  deleteExpense: jest.fn(() => Promise.resolve({}))
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

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('ExpenseTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main title', async () => {
    renderWithRouter(<ExpenseTracker />);
    const title = screen.getByRole('heading', { name: 'Expense Tracker' });
    expect(title).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('shows add expense modal when button is clicked', async () => {
    renderWithRouter(<ExpenseTracker />);
    const addButton = screen.getByText('Add Expense');
    fireEvent.click(addButton);
    expect(await screen.findByText('Add New Expense')).toBeInTheDocument();
  });
});