import * as ExpenseService from '../services/expenses.service.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// Partial mock that keeps getFirestore intact
jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore');
  return {
    ...original,
    collection: jest.fn(),
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn()
  };
});

describe('ExpenseService', () => {
  const mockCollectionRef = {};
  const userId = 'user123';
  const petId = 'pet456';

  beforeEach(() => {
    jest.clearAllMocks();
    collection.mockReturnValue(mockCollectionRef);
  });

  describe('getExpenses', () => {
    it('fetches all expenses for a user', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ item: 'Food' }) },
        { id: '2', data: () => ({ item: 'Vet' }) }
      ];
      getDocs.mockResolvedValue({ forEach: cb => mockDocs.forEach(cb), docs: mockDocs });
      query.mockReturnValue('mockQuery');

      const result = await ExpenseService.getExpenses(userId, 'all');
      expect(where).toHaveBeenCalledWith('userId', '==', userId);
      expect(orderBy).toHaveBeenCalledWith('date', 'desc');
      expect(result).toEqual([
        { id: '1', item: 'Food' },
        { id: '2', item: 'Vet' }
      ]);
    });

    it('fetches filtered expenses by petId', async () => {
      getDocs.mockResolvedValue({ forEach: cb => [], docs: [] });
      await ExpenseService.getExpenses(userId, petId);
      expect(where).toHaveBeenCalledWith('petId', '==', petId);
    });
  });

  describe('createExpense', () => {
    it('creates a new expense and returns with ID', async () => {
      const expense = { item: 'Grooming', amount: '25.00', userId };
      addDoc.mockResolvedValue({ id: 'new123' });

      const result = await ExpenseService.createExpense(expense);
      expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, {
        ...expense,
        amount: 25.0
      });
      expect(result).toEqual({
        id: 'new123',
        ...expense,
        amount: 25.0
      });
    });
  });

  describe('updateExpense', () => {
    it('updates an expense with new amount', async () => {
      const updateData = { amount: '99.99' };
      const mockDocRef = {};
      doc.mockReturnValue(mockDocRef);

      const result = await ExpenseService.updateExpense('exp456', updateData);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { amount: 99.99 });
      expect(result).toEqual({ id: 'exp456', amount: 99.99 });
    });
  });

  describe('deleteExpense', () => {
    it('deletes an expense by ID', async () => {
      const mockDocRef = {};
      doc.mockReturnValue(mockDocRef);
      await ExpenseService.deleteExpense('exp789');
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });
  });
});
