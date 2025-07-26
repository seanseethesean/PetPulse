import * as JournalService from '../services/journal.service.js';
import {
  collection,
  query,
  where,
  orderBy,
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
    orderBy: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn()
  };
});

describe('JournalService', () => {
  const userId = 'user123';
  const petName = 'Buddy';
  const mockCollectionRef = {};

  beforeEach(() => {
    jest.clearAllMocks();
    collection.mockReturnValue(mockCollectionRef);
  });

  describe('getJournalEntries', () => {
    it('fetches journal entries filtered by pet name', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ title: 'Walk' }) },
        { id: '2', data: () => ({ title: 'Vet visit' }) }
      ];
      getDocs.mockResolvedValue({ docs: mockDocs });

      const result = await JournalService.getJournalEntries(userId, petName);

      expect(where).toHaveBeenCalledWith('petName', '==', petName);
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toEqual([
        { id: '1', title: 'Walk' },
        { id: '2', title: 'Vet visit' }
      ]);
    });

    it('fetches all journal entries when petName is "all"', async () => {
      getDocs.mockResolvedValue({ docs: [] });

      const result = await JournalService.getJournalEntries(userId, 'all');

      expect(where).toHaveBeenCalledWith('userId', '==', userId);
      expect(result).toEqual([]);
    });
  });

  describe('createJournalEntry', () => {
    it('creates a journal entry and returns it with ID', async () => {
      const entry = { petName: 'Buddy', title: 'Fed breakfast' };
      const mockDocRef = { id: 'abc123' };
      addDoc.mockResolvedValue(mockDocRef);

      const result = await JournalService.createJournalEntry(entry);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: 'abc123',
        petName: 'Buddy',
        title: 'Fed breakfast'
      });
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('updateJournalEntry', () => {
    it('updates the specified journal entry', async () => {
      const mockRef = {};
      doc.mockReturnValue(mockRef);

      await JournalService.updateJournalEntry('entry789', { title: 'Updated title' });

      expect(updateDoc).toHaveBeenCalledWith(mockRef, { title: 'Updated title' });
    });
  });

  describe('deleteJournalEntry', () => {
    it('deletes the specified journal entry', async () => {
      const mockRef = {};
      doc.mockReturnValue(mockRef);

      await JournalService.deleteJournalEntry('entry999');

      expect(deleteDoc).toHaveBeenCalledWith(mockRef);
    });
  });
});