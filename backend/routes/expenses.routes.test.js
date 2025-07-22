import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import expensesRoutes from "../routes/expenses.routes.js";
import * as expenseService from "../services/expenses.service.js";
import * as validation from "../request-validation.js";
import { createExpenseSchema, updateExpenseSchema } from "../types/expenses.types.js";

const app = express();
app.use(express.json());
app.use("/api/expenses", expensesRoutes);

// Mocks
vi.mock("../services/expenses.service.js");
vi.mock("../request-validation.js");

describe("Expenses Routes", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/expenses", () => {
    it("should return 400 if userId is missing", async () => {
      const res = await request(app).get("/api/expenses");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("UserId parameter is required");
    });

    it("should return expenses if userId is provided", async () => {
      const mockExpenses = [{ id: "1", name: "Vet", cost: 100 }];
      expenseService.getExpenses.mockResolvedValue(mockExpenses);

      const res = await request(app).get("/api/expenses?userId=abc");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockExpenses);
    });

    it("should handle service errors", async () => {
      expenseService.getExpenses.mockRejectedValue(new Error("DB error"));
      const res = await request(app).get("/api/expenses?userId=abc");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to fetch expenses");
    });
  });

  describe("POST /api/expenses", () => {
    it("should create and return new expense", async () => {
      const mockValidated = { name: "Food", cost: 20 };
      const mockCreated = { id: "123", ...mockValidated };

      validation.validateRequestData.mockResolvedValue(mockValidated);
      expenseService.createExpense.mockResolvedValue(mockCreated);

      const res = await request(app).post("/api/expenses").send(mockValidated);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockCreated);
    });

    it("should handle create errors", async () => {
      validation.validateRequestData.mockResolvedValue({ name: "Toy", cost: 10 });
      expenseService.createExpense.mockRejectedValue(new Error("Insert fail"));

      const res = await request(app).post("/api/expenses").send({ name: "Toy", cost: 10 });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to create expense");
    });
  });

  describe("PUT /api/expenses/:id", () => {
    it("should update and return updated expense", async () => {
      const mockValidated = { name: "Updated Food", cost: 30 };
      const mockUpdated = { id: "1", ...mockValidated };

      validation.validateRequestData.mockResolvedValue(mockValidated);
      expenseService.updateExpense.mockResolvedValue(mockUpdated);

      const res = await request(app)
        .put("/api/expenses/1")
        .send(mockValidated);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUpdated);
    });

    it("should handle update errors", async () => {
      validation.validateRequestData.mockResolvedValue({ name: "x", cost: 1 });
      expenseService.updateExpense.mockRejectedValue(new Error("Update error"));

      const res = await request(app).put("/api/expenses/1").send({ name: "x", cost: 1 });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to update expense");
    });
  });

  describe("DELETE /api/expenses/:id", () => {
    it("should delete expense successfully", async () => {
      expenseService.deleteExpense.mockResolvedValue();

      const res = await request(app).delete("/api/expenses/1");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Expense deleted successfully");
    });

    it("should handle delete errors", async () => {
      expenseService.deleteExpense.mockRejectedValue(new Error("Delete fail"));

      const res = await request(app).delete("/api/expenses/1");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to delete expense");
    });
  });
});
