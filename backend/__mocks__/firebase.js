export const doc = jest.fn();
export const getDoc = jest.fn();
export const setDoc = jest.fn();
export const db = {}; 

const auth = jest.fn(() => ({
  createUser: jest.fn(),
  verifyIdToken: jest.fn()
}));

export default {
  auth
};
  