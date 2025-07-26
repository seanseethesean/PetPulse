export const mockCreateUser = jest.fn();
export const mockVerifyIdToken = jest.fn();

export const auth = () => ({
  createUser: mockCreateUser,
  verifyIdToken: mockVerifyIdToken,
  currentUser: { uid: "mock-user-id", email: "test@example.com" },
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
});

export const db = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ mock: true }) }),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    add: jest.fn(),
    get: jest.fn(),
    where: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({ docs: [] }),
    })),
  })),
};

export const storage = {
  ref: jest.fn(() => ({
    put: jest.fn(),
    getDownloadURL: jest.fn(),
  })),
};

export const googleProvider = {};