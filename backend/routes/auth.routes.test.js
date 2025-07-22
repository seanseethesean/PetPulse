import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import authRoutes from "../routes/auth.routes.js";
import * as authService from "../services/auth.service.js";

const app = express();
app.use(express.json());
app.use("/api", authRoutes);

vi.mock("../services/auth.service.js");

describe("Auth Routes", () => {
  afterEach(() => vi.clearAllMocks());

  describe("POST /signup", () => {
    it("should return 400 if email or password is missing", async () => {
      const res = await request(app).post("/api/signup").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email and password are required");
    });

    it("should return 400 if password is too short", async () => {
      const res = await request(app).post("/api/signup").send({
        email: "test@example.com",
        password: "123"
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password must be at least 6 characters long");
    });

    it("should return 201 and user data on success", async () => {
      const mockResult = { uid: "123", email: "test@example.com" };
      authService.signUpUser.mockResolvedValue(mockResult);

      const res = await request(app).post("/api/signup").send({
        email: "test@example.com",
        password: "123456"
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockResult);
    });

    it("should return error response if signUpUser throws", async () => {
      authService.signUpUser.mockRejectedValue({ status: 409, message: "Email already exists" });

      const res = await request(app).post("/api/signup").send({
        email: "existing@example.com",
        password: "123456"
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Email already exists");
    });
  });

  describe("POST /login", () => {
    it("should return reference message", async () => {
      const res = await request(app).post("/api/login").send();
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Firebase client SDK");
    });
  });

  describe("POST /google", () => {
    it("should return 400 if idToken is missing", async () => {
      const res = await request(app).post("/api/google").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID token is required");
    });

    it("should return 200 if token is valid", async () => {
      const mockResult = { uid: "abc123", email: "google@example.com" };
      authService.verifyGoogleToken.mockResolvedValue(mockResult);

      const res = await request(app).post("/api/google").send({
        idToken: "valid-token"
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
    });

    it("should return error if token is invalid", async () => {
      authService.verifyGoogleToken.mockRejectedValue({ status: 401, message: "Invalid token" });

      const res = await request(app).post("/api/google").send({
        idToken: "invalid"
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid token");
    });
  });
});
