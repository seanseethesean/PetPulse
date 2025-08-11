import * as AuthService from './auth.service.js';
import { getDoc, setDoc } from 'firebase/firestore';

jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore');
  return {
    ...original,
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
  };
});

const mockCreateUser = jest.fn();
const mockVerifyIdToken = jest.fn();

jest.mock('../firebase.js', () => ({
  __esModule: true,
  default: {
    auth: () => ({
      createUser: mockCreateUser,
      verifyIdToken: mockVerifyIdToken,
    }),
  },
}));

describe('AuthService', () => {
  const fakeUID = 'mock-user-id';
  const fakeEmail = 'test@example.com';
  const fakePassword = 'password123';
  const fakeToken = 'token123';
  const fakeName = 'testuser';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUpUser', () => {
    it('creates a new user and Firestore doc if not exists', async () => {
      mockCreateUser.mockResolvedValue({
        uid: fakeUID,
        email: fakeEmail,
      });

      getDoc.mockResolvedValue({ exists: () => false });
      setDoc.mockResolvedValue();

      const res = await AuthService.signUpUser(fakeEmail, fakePassword);
      expect(mockCreateUser).toHaveBeenCalledWith({
        email: fakeEmail,
        password: fakePassword,
        emailVerified: false,
      });
      expect(getDoc).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalled();
      expect(res).toEqual({
        uid: fakeUID,
        email: fakeEmail,
        message: 'User created successfully',
      });
    });

    it('throws correct error if email already exists', async () => {
      mockCreateUser.mockRejectedValue({ code: 'auth/email-already-exists' });

      await expect(AuthService.signUpUser(fakeEmail, fakePassword)).rejects.toEqual({
        status: 400,
        message: 'Email already exists',
      });
    });

    it('throws internal server error if unknown error occurs', async () => {
      mockCreateUser.mockRejectedValue({ code: 'some-unknown-error' });

      await expect(AuthService.signUpUser(fakeEmail, fakePassword)).rejects.toEqual({
        status: 500,
        message: 'Internal server error during signup',
      });
    });
  });

  describe('verifyGoogleToken', () => {
    it('verifies token and creates user doc if needed', async () => {
      const decodedToken = {
        uid: fakeUID,
        email: fakeEmail,
        name: fakeName,
        picture: 'https://example.com/photo.png',
        email_verified: true,
      };

      mockVerifyIdToken.mockResolvedValue(decodedToken);
      getDoc.mockResolvedValue({ exists: () => false });
      setDoc.mockResolvedValue();

      const res = await AuthService.verifyGoogleToken(fakeToken);
      expect(mockVerifyIdToken).toHaveBeenCalledWith(fakeToken);
      expect(getDoc).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalled();
      expect(res).toEqual({
        uid: fakeUID,
        email: fakeEmail,
        name: fakeName,
        picture: decodedToken.picture,
        emailVerified: true,
      });
    });

    it('throws correct error if token is expired', async () => {
      mockVerifyIdToken.mockRejectedValue({ code: 'auth/id-token-expired' });

      await expect(AuthService.verifyGoogleToken(fakeToken)).rejects.toEqual({
        status: 401,
        message: 'Token has expired',
      });
    });

    it('throws generic error if unknown error occurs', async () => {
      mockVerifyIdToken.mockRejectedValue({ code: 'random-error' });

      await expect(AuthService.verifyGoogleToken(fakeToken)).rejects.toEqual({
        status: 401,
        message: 'Token verification failed',
      });
    });
  });
});