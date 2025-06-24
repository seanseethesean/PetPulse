import express from "express";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.js";
import { validateRequestData } from "../request-validation.js";
import { createExpenseSchema, updateExpenseSchema } from "../types/expenses.types.js";

const router = express.Router();

// GET /api/expenses - Get all expenses for a user (with optional pet filter)
router.get("/", async (req, res) => {
  try {
    const { userId, petId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        error: "UserId parameter is required" 
      });
    }

    // Create query to get expenses for specific user
    const expensesRef = collection(db, "expenses");
    let q;
    
    if (petId && petId !== 'all') {
      q = query(
        expensesRef, 
        where("userId", "==", userId),
        where("petId", "==", petId),
        orderBy("date", "desc")
      );
    } else {
      q = query(
        expensesRef, 
        where("userId", "==", userId),
        orderBy("date", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const expenses = [];
    querySnapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
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
    const expenseData = {
      ...validated,
      amount: parseFloat(validated.amount)
    };

    // Save to firestore
    const docRef = await addDoc(collection(db, "expenses"), expenseData);
    
    // Respond to frontend
    res.status(201).json({
      id: docRef.id,
      ...expenseData
    });
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
    const updateData = { ...validated };

    // Convert amount to number if provided
    if (updateData.amount !== undefined) {
      updateData.amount = parseFloat(updateData.amount);
    }

    const expenseRef = doc(db, "expenses", id);
    await updateDoc(expenseRef, updateData);

    res.json({
      id,
      ...updateData
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await deleteDoc(doc(db, "expenses", id));
    
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

export default router;