import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExpenseTracker from './ExpenseTracker';
import { BrowserRouter } from 'react-router-dom';

// ✅ Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'test-user-id' },
    onAuthStateChanged: jest.fn((cb) => cb({ uid: 'test-user-id' }))
  })
}));

// ✅ Mock ExpenseService
const mockCreateExpense = jest.fn(() => Promise.resolve({
  id: '1',
  petName: 'Fluffy',
  description: 'Test expense',
  amount: 10,
  category: 'Food',
  date: new Date().toISOString(),
}));

const mockDeleteExpense = jest.fn(() => Promise.resolve());
const mockUpdateExpense = jest.fn(() => Promise.resolve());
const mockGetExpenses = jest.fn(() => Promise.resolve([
  {
    id: '1',
    petName: 'Fluffy',
    description: 'Test expense',
    amount: 10,
    category: 'Food',
    date: new Date().toISOString(),
  }
]));

jest.mock('../utils/expenses', () => ({
  getExpenses: () => mockGetExpenses(),
  createExpense: (data) => mockCreateExpense(data),
  deleteExpense: (id) => mockDeleteExpense(id),
  updateExpense: (id, data) => mockUpdateExpense(id, data),
}));

// ✅ Mock fetch for pets
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          success: true,
          pets: [
            { id: 1, petName: 'Fluffy' },
            { id: 2, petName: 'Rex' }
          ]
        })
    })
  );
});

describe('ExpenseTracker Component', () => {
  test('renders the header and summary section', async () => {
    render(
      <BrowserRouter>
        <ExpenseTracker />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Expense Tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Expenses/i)).toBeInTheDocument();
  });

  test('displays empty state message when no expenses exist', async () => {
    mockGetExpenses.mockImplementationOnce(() => Promise.resolve([]));

    render(
      <BrowserRouter>
        <ExpenseTracker />
      </BrowserRouter>
    );

    expect(await screen.findByText(/No expenses found/i)).toBeInTheDocument();
  });

  test('opens add expense modal when clicking Add Expense', async () => {
    render(
      <BrowserRouter>
        <ExpenseTracker />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText(/Add Expense/i));
    expect(await screen.findByText(/Add New Expense/i)).toBeInTheDocument();
  });

  test('submits new expense successfully', async () => {
    render(
      <BrowserRouter>
        <ExpenseTracker />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText(/Add Expense/i));

    fireEvent.change(await screen.findByPlaceholderText(/Description/i), {
      target: { value: 'Vet visit' },
    });

    fireEvent.change(await screen.findByPlaceholderText(/Amount/i), {
      target: { value: '55.50' },
    });

    fireEvent.click(screen.getByText(/Save Expense/i));

    await waitFor(() => {
      expect(mockCreateExpense).toHaveBeenCalled();
      expect(screen.queryByText(/Add New Expense/i)).not.toBeInTheDocument();
    });
  });

  test('deletes an expense successfully', async () => {
    window.confirm = jest.fn(() => true); // Auto-confirm

    render(
      <BrowserRouter>
        <ExpenseTracker />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Test expense/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }).nextSibling); // Trash icon

    await waitFor(() => {
      expect(mockDeleteExpense).toHaveBeenCalledWith('1');
    });
  });

  test('edits an expense successfully', async () => {
    render(
      <BrowserRouter>
        <ExpenseTracker />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText(/Edit/i));

    const descriptionInput = await screen.findByPlaceholderText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Updated expense' } });

    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(mockUpdateExpense).toHaveBeenCalledWith('1', expect.objectContaining({
        description: 'Updated expense',
      }));
    });
  });
});