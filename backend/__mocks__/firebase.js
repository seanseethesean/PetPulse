module.exports = {
  auth: {
    currentUser: { uid: "mock-user-id", email: "test@example.com" },
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  },
  db: {
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
  },
  storage: {
    ref: jest.fn(() => ({
      put: jest.fn(),
      getDownloadURL: jest.fn(),
    })),
  },
  googleProvider: {},
};  