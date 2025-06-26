import express from "express";
import { getExpenses, createExpense, updateExpense, deleteExpense } from "../services/expenses.service.js";
import { validateRequestData } from "../request-validation.js";
import { createExpenseSchema, updateExpenseSchema } from "../types/expenses.types.js";

const router = express.Router();

// GET /api/expenses - Get all expenses for a user (with optional pet filter)
router.get("/", async (req, res) => {
  try {
    const { userId, petId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "UserId parameter is required" });
    }

    const expenses = await getExpenses(userId, petId);
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST /api/expenses - Create new expense
router.post("/", async (req, res) => {
  try {
    const validated = await validateRequestData(req.body, createExpenseSchema);
    const createdExpense = await createExpense(validated);
    res.status(201).json(createdExpense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: "Failed to create expense" });
  }
});

// PUT /api/expenses/:id - Update expense
router.put("/:id", async (req, res) => {
  try {
    const validated = await validateRequestData(req.body, updateExpenseSchema);
    const { id } = req.params;
    const updatedExpense = await updateExpense(id, validated);
    res.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteExpense(id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

export default router;