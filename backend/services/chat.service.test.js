import * as ChatService from '../services/chat.service.js';
import { collection, doc, getDocs, setDoc, query, orderBy } from 'firebase/firestore';

jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn()
  };
});

describe('ChatService', () => {
  const chatId = 'chat123';
  const message = { content: 'Hello', senderId: 'user1', timestamp: 12345 };

  describe('getMessages', () => {
    it('fetches and maps messages from Firestore', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ content: 'Hi' }) },
        { id: '2', data: () => ({ content: 'Hey' }) }
      ];

      const mockSnapshot = { docs: mockDocs };
      const mockRef = {};
      const mockQuery = {};

      collection.mockReturnValue(mockRef);
      orderBy.mockReturnValue('order');
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await ChatService.getMessages(chatId);

      expect(collection).toHaveBeenCalledWith(expect.anything(), `chats/${chatId}/messages`);
      expect(query).toHaveBeenCalledWith(mockRef, 'order');
      expect(result).toEqual([
        { id: '1', content: 'Hi' },
        { id: '2', content: 'Hey' }
      ]);
    });
  });

  describe('sendMessage', () => {
    it('sends a message to Firestore and returns its ID', async () => {
      const mockMsgRef = { id: 'msg789' };
      const mockCollectionRef = {};

      collection.mockReturnValue(mockCollectionRef);
      doc.mockReturnValue(mockMsgRef);
      setDoc.mockResolvedValue();

      const result = await ChatService.sendMessage(chatId, message);

      expect(collection).toHaveBeenCalledWith(expect.anything(), `chats/${chatId}/messages`);
      expect(doc).toHaveBeenCalledWith(mockCollectionRef);
      expect(setDoc).toHaveBeenCalledWith(mockMsgRef, message);
      expect(result).toBe('msg789');
    });
  });
});