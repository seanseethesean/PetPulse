import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PetMgm from './PetMgm';
import { BrowserRouter } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

// 🔧 Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'test-user-id' }
  })
}));

// 🔧 Mock PetService
const mockGetPets = jest.fn(() => Promise.resolve({
  success: true,
  pets: [
    {
      id: '1',
      petName: 'Buddy',
      animalType: 'Dog',
      breed: 'Labrador',
      birthday: '2020-01-01'
    }
  ]
}));

const mockCreatePet = jest.fn(() => Promise.resolve({ success: true }));
const mockUpdatePet = jest.fn(() => Promise.resolve({ success: true }));
const mockDeletePet = jest.fn(() => Promise.resolve({ success: true }));

jest.mock('../utils/pet', () => ({
  getPets: () => mockGetPets(),
  createPet: (data) => mockCreatePet(data),
  updatePet: (id, data) => mockUpdatePet(id, data),
  deletePet: (id) => mockDeletePet(id),
}));

describe('PetMgm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders existing pets', async () => {
    render(
      <BrowserRouter>
        <PetMgm />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Buddy/)).toBeInTheDocument();
    expect(screen.getByText(/Dog/)).toBeInTheDocument();
    expect(screen.getByText(/Labrador/)).toBeInTheDocument();
  });

  test('validates empty fields when adding pet', async () => {
    render(
      <BrowserRouter>
        <PetMgm />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Add New Pet/i));

    expect(await screen.findByText(/required/i)).toBeInTheDocument();
    expect(mockCreatePet).not.toHaveBeenCalled();
  });

  test('submits new pet successfully', async () => {
    render(
      <BrowserRouter>
        <PetMgm />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: 'Max' }
    });
    fireEvent.change(screen.getByPlaceholderText(/animal type/i), {
      target: { value: 'Cat' }
    });
    fireEvent.change(screen.getByPlaceholderText(/breed/i), {
      target: { value: 'Siamese' }
    });

    fireEvent.click(screen.getByText(/Add New Pet/i));

    await waitFor(() => {
      expect(mockCreatePet).toHaveBeenCalledWith(expect.objectContaining({
        petName: 'Max',
        animalType: 'Cat',
        breed: 'Siamese',
        userId: 'test-user-id'
      }));
    });
  });

  test('edits a pet', async () => {
    render(
      <BrowserRouter>
        <PetMgm />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText('Edit'));

    const nameInput = screen.getByDisplayValue('Buddy');
    fireEvent.change(nameInput, { target: { value: 'Buddy Jr.' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockUpdatePet).toHaveBeenCalledWith('1', expect.objectContaining({
        petName: 'Buddy Jr.'
      }));
    });
  });

  test('deletes a pet', async () => {
    window.confirm = jest.fn(() => true); // auto-confirm

    render(
      <BrowserRouter>
        <PetMgm />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText('Delete'));

    await waitFor(() => {
      expect(mockDeletePet).toHaveBeenCalledWith('1');
    });
  });

  test('selects a pet and navigates', async () => {
    const localStorageSetItem = jest.spyOn(Storage.prototype, 'setItem');

    render(
      <BrowserRouter>
        <PetMgm />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText('Select Pet'));

    expect(localStorageSetItem).toHaveBeenCalledWith('selectedPetName', 'Buddy');
  });
});