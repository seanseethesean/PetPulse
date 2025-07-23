import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import journalRoutes from "../routes/journal.routes.js";
import * as journalService from "../services/journal.service.js";
import * as validation from "../request-validation.js";
import { createJournalSchema, updateJournalSchema } from "../types/journal.types.js";

const app = express();
app.use(express.json());
app.use("/api/journal", journalRoutes);

// Mocks
vi.mock("../services/journal.service.js");
vi.mock("../request-validation.js");

describe("Journal Routes", () => {
  afterEach(() => vi.clearAllMocks());

  describe("GET /api/journal", () => {
    it("should return 400 if userId or petName is missing", async () => {
      const res = await request(app).get("/api/journal?userId=test");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, error: "Missing userId or petName" });
    });

    it("should return entries if userId and petName are provided", async () => {
      const mockEntries = [{ id: "1", note: "Walked the dog" }];
      journalService.getJournalEntries.mockResolvedValue(mockEntries);

      const res = await request(app).get("/api/journal?userId=test&petName=Fluffy");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, entries: mockEntries });
    });

    it("should handle service error", async () => {
      journalService.getJournalEntries.mockRejectedValue(new Error("Fetch error"));

      const res = await request(app).get("/api/journal?userId=test&petName=Fluffy");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to fetch entries");
    });
  });

  describe("POST /api/journal", () => {
    it("should create a journal entry", async () => {
      const mockValidated = { note: "Fed cat" };
      const mockCreated = { id: "2", note: "Fed cat" };

      validation.validateRequestData.mockResolvedValue(mockValidated);
      journalService.createJournalEntry.mockResolvedValue(mockCreated);

      const res = await request(app).post("/api/journal").send(mockValidated);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ success: true, ...mockCreated });
    });

    it("should handle creation error", async () => {
      validation.validateRequestData.mockResolvedValue({ note: "x" });
      journalService.createJournalEntry.mockRejectedValue(new Error("Create fail"));

      const res = await request(app).post("/api/journal").send({ note: "x" });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to create entry");
    });
  });

  describe("PUT /api/journal/:id", () => {
    it("should update a journal entry", async () => {
      validation.validateRequestData.mockResolvedValue({ note: "Updated note" });
      journalService.updateJournalEntry.mockResolvedValue();

      const res = await request(app).put("/api/journal/123").send({ note: "Updated note" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });

    it("should handle update error", async () => {
      validation.validateRequestData.mockResolvedValue({ note: "fail" });
      journalService.updateJournalEntry.mockRejectedValue(new Error("Update error"));

      const res = await request(app).put("/api/journal/123").send({ note: "fail" });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: "Update error" });
    });
  });

  describe("DELETE /api/journal/:id", () => {
    it("should delete a journal entry", async () => {
      journalService.deleteJournalEntry.mockResolvedValue();

      const res = await request(app).delete("/api/journal/456");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });

    it("should handle delete error", async () => {
      journalService.deleteJournalEntry.mockRejectedValue(new Error("Delete fail"));

      const res = await request(app).delete("/api/journal/456");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: "Delete fail" });
    });
  });
});
