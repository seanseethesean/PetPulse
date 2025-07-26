// auth.service.test.js
import admin from "../firebase.js";
import { db, doc, setDoc, getDoc } from "../firebase.js";
import { signUpUser, verifyGoogleToken } from "./auth.service.js";

jest.mock("../firebase.js");

describe("Auth Service", () => {
  let mockCreateUser;
  let mockVerifyIdToken;

  beforeEach(() => {
    // Mock Firebase Auth methods
    mockCreateUser = jest.fn();
    mockVerifyIdToken = jest.fn();

    // Proper mock implementation of admin.auth()
    admin.auth.mockImplementation(() => ({
      createUser: mockCreateUser,
      verifyIdToken: mockVerifyIdToken
    }));

    // Mock Firestore methods
    doc.mockReset();
    getDoc.mockReset();
    setDoc.mockReset();

    // Provide default mock behaviors
    doc.mockImplementation((...args) => `mockedDocRef-${args.join("-")}`);
    getDoc.mockResolvedValue({ exists: () => false });
    setDoc.mockResolvedValue();

    jest.clearAllMocks();
  });

  describe("signUpUser", () => {
    it("should create user and Firestore doc if user does not exist", async () => {
      mockCreateUser.mockResolvedValue({
        uid: "uid123",
        email: "test@example.com"
      });

      getDoc.mockResolvedValue({ exists: () => false });

      const result = await signUpUser("test@example.com", "password123");

      expect(mockCreateUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        emailVerified: false
      });

      expect(setDoc).toHaveBeenCalledWith(
        expect.stringContaining("mockedDocRef"), // or just "mockedDocRef-users-uid123"
        expect.objectContaining({
          email: "test@example.com"
        })
      );

      expect(result).toEqual(expect.objectContaining({
        uid: "uid123",
        message: "User created successfully"
      }));
    });

    it("should not create Firestore doc if it already exists", async () => {
      mockCreateUser.mockResolvedValue({
        uid: "uid456",
        email: "exists@example.com"
      });

      getDoc.mockResolvedValue({ exists: () => true });

      const result = await signUpUser("exists@example.com", "password123");

      expect(setDoc).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        uid: "uid456"
      }));
    });

    it("should handle known Firebase auth errors", async () => {
      mockCreateUser.mockRejectedValue({ code: "auth/email-already-exists" });

      await expect(signUpUser("test@example.com", "password123"))
        .rejects.toEqual({
          status: 400,
          message: "Email already exists"
        });
    });

    it("should handle unknown Firebase auth errors", async () => {
      mockCreateUser.mockRejectedValue({ code: "some/unknown-error" });

      await expect(signUpUser("test@example.com", "password123"))
        .rejects.toEqual({
          status: 500,
          message: "Internal server error during signup"
        });
    });
  });

  describe("verifyGoogleToken", () => {
    it("should verify token and create user doc if not exists", async () => {
      const decodedToken = {
        uid: "uid789",
        email: "google@example.com",
        name: "Google User",
        picture: "pic_url",
        email_verified: true
      };

      mockVerifyIdToken.mockResolvedValue(decodedToken);
      getDoc.mockResolvedValue({ exists: () => false });

      const result = await verifyGoogleToken("valid_token");

      expect(mockVerifyIdToken).toHaveBeenCalledWith("valid_token");
      expect(setDoc).toHaveBeenCalled();

      expect(result).toEqual({
        uid: "uid789",
        email: "google@example.com",
        name: "Google User",
        picture: "pic_url",
        emailVerified: true
      });
    });

    it("should throw mapped error for expired token", async () => {
      mockVerifyIdToken.mockRejectedValue({ code: "auth/id-token-expired" });

      await expect(verifyGoogleToken("expired_token"))
        .rejects.toEqual({
          status: 401,
          message: "Token has expired"
        });
    });

    it("should throw default error for unknown token errors", async () => {
      mockVerifyIdToken.mockRejectedValue({ code: "some/unknown-error" });

      await expect(verifyGoogleToken("unknown_token"))
        .rejects.toEqual({
          status: 401,
          message: "Token verification failed"
        });
    });
  });
});
