import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PetJournal from './PetJournal';
import { BrowserRouter } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

// 🔧 Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'test-user-id' }
  })
}));

// 🔧 Mock JournalService
const mockGetEntries = jest.fn(() => Promise.resolve({
  success: true,
  entries: [
    {
      id: '1',
      title: 'Vet Visit',
      content: 'Went to the vet for vaccinations.',
      mood: 'sick',
      activities: ['Vet Visit'],
      date: new Date().toISOString().split("T")[0]
    }
  ]
}));

const mockCreateEntry = jest.fn(() => Promise.resolve({ success: true }));
const mockUpdateEntry = jest.fn(() => Promise.resolve({ success: true }));
const mockDeleteEntry = jest.fn(() => Promise.resolve({ success: true }));

jest.mock('../utils/journal', () => ({
  getEntries: () => mockGetEntries(),
  createEntry: (data) => mockCreateEntry(data),
  updateEntry: (id, data) => mockUpdateEntry(id, data),
  deleteEntry: (id) => mockDeleteEntry(id),
}));

// 🔧 Mock fetch for pets
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          success: true,
          pets: [
            { id: 1, petName: 'Fluffy' },
            { id: 2, petName: 'Milo' }
          ]
        })
    })
  );
});

describe('PetJournal Component', () => {
  test('renders pet selector and waits for pet list', async () => {
    render(
      <BrowserRouter>
        <PetJournal />
      </BrowserRouter>
    );

    expect(await screen.findByLabelText(/select pet/i)).toBeInTheDocument();
    expect(await screen.findByText(/Fluffy/)).toBeInTheDocument();
  });

  test('shows journal entries after selecting a pet', async () => {
    render(
      <BrowserRouter>
        <PetJournal />
      </BrowserRouter>
    );

    // Select Fluffy
    const select = await screen.findByLabelText(/select pet/i);
    fireEvent.change(select, { target: { value: 'Fluffy' } });

    expect(await screen.findByText(/Vet Visit/)).toBeInTheDocument();
    expect(screen.getByText(/Went to the vet/)).toBeInTheDocument();
  });

  test('opens and fills Add Entry form', async () => {
    render(
      <BrowserRouter>
        <PetJournal />
      </BrowserRouter>
    );

    fireEvent.change(await screen.findByLabelText(/select pet/i), {
      target: { value: 'Fluffy' }
    });

    fireEvent.click(await screen.findByText(/Add New Entry/i));

    fireEvent.change(screen.getByPlaceholderText(/Entry title.../i), {
      target: { value: 'Walk in the park' }
    });
    fireEvent.change(screen.getByPlaceholderText(/What happened today/i), {
      target: { value: 'We had a fun walk.' }
    });

    fireEvent.click(screen.getByText(/Save Entry/i));

    await waitFor(() => {
      expect(mockCreateEntry).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Walk in the park',
        content: 'We had a fun walk.',
        mood: 'happy',
        activities: expect.any(Array),
      }));
    });
  });

  test('edits an entry', async () => {
    render(
      <BrowserRouter>
        <PetJournal />
      </BrowserRouter>
    );

    fireEvent.change(await screen.findByLabelText(/select pet/i), {
      target: { value: 'Fluffy' }
    });

    fireEvent.click(await screen.findByText(/Edit/i));

    const titleInput = screen.getByPlaceholderText(/Entry title.../i);
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    fireEvent.click(screen.getByText(/Update Entry/i));

    await waitFor(() => {
      expect(mockUpdateEntry).toHaveBeenCalledWith('1', expect.objectContaining({
        title: 'Updated Title',
      }));
    });
  });

  test('deletes an entry', async () => {
    window.confirm = jest.fn(() => true); // Auto-confirm

    render(
      <BrowserRouter>
        <PetJournal />
      </BrowserRouter>
    );

    fireEvent.change(await screen.findByLabelText(/select pet/i), {
      target: { value: 'Fluffy' }
    });

    fireEvent.click(await screen.findByText(/Delete/i));

    await waitFor(() => {
      expect(mockDeleteEntry).toHaveBeenCalledWith('1');
    });
  });
});