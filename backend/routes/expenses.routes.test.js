import request from "supertest";
import express from "express";
import expensesRoutes from "../routes/expenses.routes.js";
import * as expensesService from "../services/expenses.service.js";
import * as validation from "../request-validation.js";
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

// Setup test app
const app = express();
app.use(express.json());
app.use("/api/expenses", expensesRoutes);

describe("Expenses Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // silence logs
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/expenses", () => {
    it("should return 400 if userId is missing", async () => {
      const res = await request(app).get("/api/expenses");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("UserId parameter is required");
    });

    it("should return expenses when userId is provided", async () => {
      const mockExpenses = [{ id: 1, name: "Vet", amount: 50 }];
      jest.spyOn(expensesService, "getExpenses").mockResolvedValue(mockExpenses);

      const res = await request(app).get("/api/expenses?userId=123");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockExpenses);
    });

    it("should return 500 on service error", async () => {
      jest.spyOn(expensesService, "getExpenses").mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/expenses?userId=123");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to fetch expenses");
    });
  });

  describe("POST /api/expenses", () => {
    it("should create an expense successfully", async () => {
      const mockData = { name: "Food", amount: 20 };
      jest.spyOn(validation, "validateRequestData").mockResolvedValue(mockData);
      jest.spyOn(expensesService, "createExpense").mockResolvedValue({ id: "abc123", ...mockData });

      const res = await request(app).post("/api/expenses").send(mockData);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: "abc123", ...mockData });
    });

    it("should return 500 if validation or service fails", async () => {
      jest.spyOn(validation, "validateRequestData").mockRejectedValue(new Error("Invalid"));

      const res = await request(app).post("/api/expenses").send({});
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to create expense");
    });
  });

  describe("PUT /api/expenses/:id", () => {
    it("should update an expense successfully", async () => {
      const updated = { name: "Updated", amount: 999 };
      jest.spyOn(validation, "validateRequestData").mockResolvedValue(updated);
      jest.spyOn(expensesService, "updateExpense").mockResolvedValue({ id: "1", ...updated });

      const res = await request(app).put("/api/expenses/1").send(updated);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: "1", ...updated });
    });

    it("should return 500 if update fails", async () => {
      jest.spyOn(validation, "validateRequestData").mockResolvedValue({});
      jest.spyOn(expensesService, "updateExpense").mockRejectedValue(new Error("Failed"));

      const res = await request(app).put("/api/expenses/1").send({});
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to update expense");
    });
  });

  describe("DELETE /api/expenses/:id", () => {
    it("should delete the expense successfully", async () => {
      jest.spyOn(expensesService, "deleteExpense").mockResolvedValue();

      const res = await request(app).delete("/api/expenses/1");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Expense deleted successfully");
    });

    it("should return 500 if delete fails", async () => {
      jest.spyOn(expensesService, "deleteExpense").mockRejectedValue(new Error("Fail"));

      const res = await request(app).delete("/api/expenses/1");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to delete expense");
    });
  });
});
