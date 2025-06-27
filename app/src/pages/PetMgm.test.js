import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PetMgm from './PetMgm';
import { BrowserRouter } from 'react-router-dom';

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'test-user-id' }
  })
}));

// Minimal mocks for pet service
jest.mock('../utils/pet', () => ({
  getPets: () => Promise.resolve({
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
  }),
  createPet: jest.fn(() => Promise.resolve({ success: true }))
}));

describe('PetMgm (simple)', () => {
  test('shows existing pet name', async () => {
    render(
      <BrowserRouter>
        <PetMgm />
      </BrowserRouter>
    );

    expect(await screen.findByText('Buddy')).toBeInTheDocument();
  });

  test('opens add pet form when button clicked', () => {
    render(
      <BrowserRouter>
        <PetMgm />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add New Pet'));
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
  });
});