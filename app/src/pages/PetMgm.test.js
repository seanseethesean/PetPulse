import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PetMgm from './PetMgm';
import { BrowserRouter } from 'react-router-dom';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Firebase Auth mock
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'test-user-id' }
  })
}));

// Pet service mock
const mockGetPets = jest.fn();
const mockCreatePet = jest.fn();
const mockUpdatePet = jest.fn();
const mockDeletePet = jest.fn();

jest.mock('../utils/pet', () => ({
  getPets: (...args) => mockGetPets(...args),
  createPet: (...args) => mockCreatePet(...args),
  updatePet: (...args) => mockUpdatePet(...args),
  deletePet: (...args) => mockDeletePet(...args)
}));

beforeEach(() => {
  mockGetPets.mockResolvedValue({
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
  });

  mockCreatePet.mockResolvedValue({ success: true });
  mockUpdatePet.mockResolvedValue({ success: true });
  mockDeletePet.mockResolvedValue({ success: true });

  jest.spyOn(window, 'confirm').mockImplementation(() => true);
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});

const setup = () =>
  render(
    <BrowserRouter>
      <PetMgm />
    </BrowserRouter>
  );

describe('PetMgm', () => {
  test('renders existing pets', async () => {
    setup();
    expect(await screen.findByText('Buddy')).toBeInTheDocument();
  });

  test('adds a new pet with valid input', async () => {
    setup();

    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'Max', name: 'petName' }
    });
    fireEvent.change(screen.getByPlaceholderText('animal type'), {
      target: { value: 'Cat', name: 'animalType' }
    });
    fireEvent.change(screen.getByPlaceholderText('breed'), {
      target: { value: 'Siamese', name: 'breed' }
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '2021-01-01', name: 'birthday' }
    });

    fireEvent.click(screen.getByText('Add New Pet'));

    await waitFor(() => {
      expect(mockCreatePet).toHaveBeenCalledWith(
        expect.objectContaining({
          petName: 'Max',
          animalType: 'Cat',
          breed: 'Siamese',
          birthday: '2021-01-01',
          userId: 'test-user-id'
        })
      );
    });
  });

  test('shows validation errors if form is incomplete', async () => {
    setup();
    fireEvent.click(screen.getByText('Add New Pet'));
  
    const errors = await screen.findAllByText('required');
    expect(errors).toHaveLength(3);
  });  

  test('edits a pet successfully', async () => {
    setup();

    fireEvent.click(await screen.findByText('Edit'));
    const nameInput = screen.getByDisplayValue('Buddy');
    fireEvent.change(nameInput, { target: { value: 'Buddy2' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockUpdatePet).toHaveBeenCalledWith('1', expect.objectContaining({
        petName: 'Buddy2'
      }));
    });
  });

  test('cancels editing', async () => {
    setup();
    fireEvent.click(await screen.findByText('Edit'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByDisplayValue('Buddy')).not.toBeInTheDocument();
  });

  test('deletes a pet', async () => {
    setup();
    fireEvent.click(await screen.findByText('Delete'));

    await waitFor(() => {
      expect(mockDeletePet).toHaveBeenCalledWith('1');
    });
  });

  test('selects a pet and navigates home', async () => {
    setup();
    fireEvent.click(await screen.findByText('Select Pet'));

    expect(mockNavigate).toHaveBeenCalledWith('/home');
    expect(localStorage.getItem('selectedPetName')).toBe('Buddy');
  });
  
  test('logs error if createPet fails', async () => {
    mockCreatePet.mockResolvedValueOnce({ success: false, error: 'Create failed' });
  
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    setup();
  
    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'Max', name: 'petName' }
    });
    fireEvent.change(screen.getByPlaceholderText('animal type'), {
      target: { value: 'Cat', name: 'animalType' }
    });
    fireEvent.change(screen.getByPlaceholderText('breed'), {
      target: { value: 'Siamese', name: 'breed' }
    });
  
    fireEvent.click(screen.getByText('Add New Pet'));
  
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to add pet:', 'Create failed');
    });
  
    consoleSpy.mockRestore();
  });
  
  test('logs error if deletePet fails', async () => {
    mockDeletePet.mockResolvedValueOnce({ success: false, error: 'Delete failed' });
  
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    setup();
  
    fireEvent.click(await screen.findByText('Delete'));
  
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Delete failed:', 'Delete failed');
    });
  
    consoleSpy.mockRestore();
  });
  
  test('logs error if updatePet fails', async () => {
    mockUpdatePet.mockResolvedValueOnce({ success: false, error: 'Update failed' });
  
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    setup();
  
    fireEvent.click(await screen.findByText('Edit'));
    fireEvent.click(screen.getByText('Save'));
  
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Update failed:', 'Update failed');
    });
  
    consoleSpy.mockRestore();
  });
  
});