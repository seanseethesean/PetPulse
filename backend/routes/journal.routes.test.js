import request from "supertest";
import express from "express";
import journalRoutes from "../routes/journal.routes.js";
import * as journalService from "../services/journal.service.js";
import * as validation from "../request-validation.js";
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

jest.mock("../firebase");
const app = express();
app.use(express.json());
app.use("/api/journal", journalRoutes);

describe("Journal Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/journal", () => {
    it("should return 400 if userId or petName is missing", async () => {
      const res = await request(app).get("/api/journal?userId=123");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Missing userId or petName");
    });

    it("should return journal entries for valid request", async () => {
      const mockEntries = [{ id: "1", title: "First entry" }];
      jest.spyOn(journalService, "getJournalEntries").mockResolvedValue(mockEntries);

      const res = await request(app).get("/api/journal?userId=123&petName=Fluffy");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.entries).toEqual(mockEntries);
    });

    it("should return 500 on service failure", async () => {
      jest.spyOn(journalService, "getJournalEntries").mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/journal?userId=123&petName=Fluffy");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to fetch entries");
    });
  });

  describe("POST /api/journal", () => {
    it("should create a journal entry successfully", async () => {
      const mockData = { title: "A good day", content: "Went to the park" };
      const mockCreated = { id: "xyz", ...mockData };

      jest.spyOn(validation, "validateRequestData").mockResolvedValue(mockData);
      jest.spyOn(journalService, "createJournalEntry").mockResolvedValue(mockCreated);

      const res = await request(app).post("/api/journal").send(mockData);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toEqual({ success: true, ...mockCreated });
    });

    it("should return 500 if validation or creation fails", async () => {
      jest.spyOn(validation, "validateRequestData").mockRejectedValue(new Error("Validation failed"));

      const res = await request(app).post("/api/journal").send({});
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to create entry");
    });
  });

  describe("PUT /api/journal/:id", () => {
    it("should update a journal entry successfully", async () => {
      const mockUpdate = { title: "Updated", content: "Updated content" };

      jest.spyOn(validation, "validateRequestData").mockResolvedValue(mockUpdate);
      jest.spyOn(journalService, "updateJournalEntry").mockResolvedValue();

      const res = await request(app).put("/api/journal/1").send(mockUpdate);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 500 if update fails", async () => {
      jest.spyOn(validation, "validateRequestData").mockResolvedValue({});
      jest.spyOn(journalService, "updateJournalEntry").mockRejectedValue(new Error("Update error"));

      const res = await request(app).put("/api/journal/1").send({});
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Update error");
    });
  });

  describe("DELETE /api/journal/:id", () => {
    it("should delete a journal entry successfully", async () => {
      jest.spyOn(journalService, "deleteJournalEntry").mockResolvedValue();

      const res = await request(app).delete("/api/journal/123");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 500 if deletion fails", async () => {
      jest.spyOn(journalService, "deleteJournalEntry").mockRejectedValue(new Error("Delete error"));

      const res = await request(app).delete("/api/journal/123");
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Delete error");
    });
  });
});