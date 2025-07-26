import * as TaskService from '../services/tasks.service.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

jest.mock("../firebase");
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
    deleteDoc: jest.fn(),
    writeBatch: jest.fn()
  };
});

describe('TaskService', () => {
  const mockCollectionRef = {};
  const mockDocRef = {};
  const userId = 'user123';

  beforeEach(() => {
    jest.clearAllMocks();
    collection.mockReturnValue(mockCollectionRef);
    doc.mockReturnValue(mockDocRef);
  });

  describe('getTasks', () => {
    it('fetches tasks by date and user', async () => {
      const mockDocs = [
        { id: 't1', data: () => ({ title: 'Task 1' }) },
        { id: 't2', data: () => ({ title: 'Task 2' }) }
      ];
      getDocs.mockResolvedValue({
        forEach: (cb) => mockDocs.forEach(cb),
        docs: mockDocs
      });

      const result = await TaskService.getTasks('2025-07-27', userId);
      expect(query).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 't1', title: 'Task 1' },
        { id: 't2', title: 'Task 2' }
      ]);
    });
  });

  describe('createTask', () => {
    it('creates a single (non-recurring) task', async () => {
      const mockBatch = { set: jest.fn(), commit: jest.fn() };
      writeBatch.mockReturnValue(mockBatch);

      const task = {
        title: 'Feed pet',
        type: 'care',
        petId: 'pet123',
        time: '09:00',
        notes: 'Dry food',
        userId,
        date: '2025-07-28',
        isRecurring: false
      };

      const result = await TaskService.createTask(task);

      expect(mockBatch.set).toHaveBeenCalledTimes(1);
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Tasks created in batch' });
    });

    it('creates recurring daily tasks', async () => {
      const mockBatch = { set: jest.fn(), commit: jest.fn() };
      writeBatch.mockReturnValue(mockBatch);

      const task = {
        title: 'Walk pet',
        type: 'exercise',
        petId: 'pet123',
        time: '07:00',
        notes: '15 mins walk',
        userId,
        date: '2025-07-28',
        isRecurring: true,
        recurring: 'daily'
      };

      await TaskService.createTask(task);

      expect(mockBatch.set).toHaveBeenCalledTimes(30); // daily: 30 days
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('updates a task by ID', async () => {
      const updateData = { title: 'Updated task' };
      doc.mockReturnValue(mockDocRef);

      const result = await TaskService.updateTask('task1', updateData);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, updateData);
      expect(result).toEqual({ id: 'task1', ...updateData });
    });
  });

  describe('deleteTask', () => {
    it('deletes a task by ID', async () => {
      doc.mockReturnValue(mockDocRef);
      await TaskService.deleteTask('task2');
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });
  });

  describe('toggleTaskCompletion', () => {
    it('toggles completion status of a task', async () => {
      doc.mockReturnValue(mockDocRef);
      const result = await TaskService.toggleTaskCompletion('task3', true);

      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { completed: true });
      expect(result).toEqual({ id: 'task3', completed: true });
    });
  });
});