import * as AuthService from '../services/auth.service.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
const mockCreateUser = jest.fn();
const mockVerifyIdToken = jest.fn();

jest.mock("../firebase");
jest.mock('../firebase.js', () => {
  const original = jest.requireActual('../firebase.js');
  return {
    __esModule: true,
    ...original,
    default: {
      auth: () => ({
        createUser: mockCreateUser,
        verifyIdToken: mockVerifyIdToken,
      })
    }
  };
});

jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore');
  return {
    ...original,
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
  };
});

describe('AuthService', () => {
    const fakeUID = 'user123';
    const fakeEmail = 'test@example.com';
    const userRefMock = { id: 'someRef' };
  
    beforeEach(() => {
      jest.clearAllMocks();
      doc.mockReturnValue(userRefMock);
    });
  
    describe('signUpUser', () => {
      it('creates a new user and Firestore doc if not exists', async () => {
        mockCreateUser.mockResolvedValue({ uid: fakeUID, email: fakeEmail });
        getDoc.mockResolvedValue({ exists: () => false });
        setDoc.mockResolvedValue();
  
        const result = await AuthService.signUpUser(fakeEmail, 'password123');
  
        expect(result).toEqual({
          uid: fakeUID,
          email: fakeEmail,
          message: 'User created successfully',
        });
  
        expect(setDoc).toHaveBeenCalledWith(
          userRefMock,
          expect.objectContaining({
            email: fakeEmail,
            displayName: 'test',
            followers: [],
            following: [],
          })
        );
      });
  
      it('handles Firebase auth/email-already-exists error', async () => {
        mockCreateUser.mockRejectedValue({ code: 'auth/email-already-exists' });
  
        await expect(AuthService.signUpUser(fakeEmail, 'password123'))
          .rejects.toEqual({ status: 400, message: 'Email already exists' });
      });
    });
  
    describe('verifyGoogleToken', () => {
      const idToken = 'abc123';
      const decoded = {
        uid: fakeUID,
        email: fakeEmail,
        name: 'Test User',
        picture: 'http://pic.com',
        email_verified: true,
      };
  
      it('verifies token and creates Firestore doc if not exists', async () => {
        mockVerifyIdToken.mockResolvedValue(decoded);
        getDoc.mockResolvedValue({ exists: () => false });
        setDoc.mockResolvedValue();
  
        const result = await AuthService.verifyGoogleToken(idToken);
  
        expect(result).toEqual({
          uid: fakeUID,
          email: fakeEmail,
          name: 'Test User',
          picture: 'http://pic.com',
          emailVerified: true,
        });
  
        expect(setDoc).toHaveBeenCalledWith(
          userRefMock,
          expect.objectContaining({
            email: fakeEmail,
            displayName: 'test',
          })
        );
      });
  
      it('handles auth/id-token-expired error', async () => {
        mockVerifyIdToken.mockRejectedValue({ code: 'auth/id-token-expired' });
  
        await expect(AuthService.verifyGoogleToken(idToken))
          .rejects.toEqual({ status: 401, message: 'Token has expired' });
      });
    });
  });  