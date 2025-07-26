import * as PetService from '../services/pet.service.js';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn()
  };
});

describe('PetService', () => {
  const userId = 'user123';
  const mockCollectionRef = {};

  beforeEach(() => {
    jest.clearAllMocks();
    collection.mockReturnValue(mockCollectionRef);
  });

  describe('getUserPets', () => {
    it('fetches all pets for a specific user', async () => {
      const mockDocs = [
        { id: 'pet1', data: () => ({ name: 'Fluffy' }) },
        { id: 'pet2', data: () => ({ name: 'Max' }) }
      ];

      getDocs.mockResolvedValue({ docs: mockDocs });

      const result = await PetService.getUserPets(userId);

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'pets');
      expect(where).toHaveBeenCalledWith('userId', '==', userId);
      expect(result).toEqual([
        { id: 'pet1', name: 'Fluffy' },
        { id: 'pet2', name: 'Max' }
      ]);
    });
  });

  describe('createPet', () => {
    it('creates a new pet and returns its ID', async () => {
      const petData = { name: 'Coco', userId };
      const mockDocRef = { id: 'newPet123' };

      // Simulate doc().id call
      const generatedId = 'fake-generated-id';
      doc.mockReturnValueOnce({ id: generatedId });
      addDoc.mockResolvedValue(mockDocRef);

      const result = await PetService.createPet(petData);

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'pets');
      expect(doc).toHaveBeenCalledWith(mockCollectionRef);
      expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, {
        ...petData,
        petId: generatedId
      });
      expect(result).toEqual({ id: 'newPet123' });
    });
  });

  describe('updatePet', () => {
    it('updates an existing pet', async () => {
      const updateData = { name: 'UpdatedName' };
      const mockRef = {};
      doc.mockReturnValue(mockRef);

      await PetService.updatePet('pet999', updateData);
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'pets', 'pet999');
      expect(updateDoc).toHaveBeenCalledWith(mockRef, updateData);
    });
  });

  describe('deletePet', () => {
    it('deletes a pet by ID', async () => {
      const mockRef = {};
      doc.mockReturnValue(mockRef);

      await PetService.deletePet('pet888');
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'pets', 'pet888');
      expect(deleteDoc).toHaveBeenCalledWith(mockRef);
    });
  });
});