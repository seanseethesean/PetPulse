import express from "express";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase.js";
import { validateRequestData } from "../request-validation.js";
import { createTaskSchema, updateTaskSchema } from "../types/tasks.js";

const router = express.Router();

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const { date, userId } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        error: "Date parameter is required (format: YYYY-MM-DD)" 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        error: "UserId parameter is required" 
      });
    }

    // Create query to get tasks for specific date and user
    const tasksRef = collection(db, "tasks");
    const q = query(
      tasksRef, 
      where("date", "==", date),
      where("userId", "==", userId),
      orderBy("time", "asc")
    );
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST /api/tasks  create new task
router.post("/", async (req, res) => {
  try {
    const validated = await validateRequestData(req.body, createTaskSchema);
    const taskData = {
      ...validated,
      completed: validated.completed || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to firestore
    const docRef = await addDoc(collection(db, "tasks"), taskData);
    
    // respond to frontend
    res.status(201).json({
      id: docRef.id,
      ...taskData
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PUT /api/tasks/:id  update task
router.put("/:id", async (req, res) => {
  try {
    const validated = await validateRequestData(req.body, updateTaskSchema);
    const { id } = req.params;
    const updateData = {
      ...validated,
      updatedAt: new Date().toISOString()
    };

    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, updateData);

    res.json({
      id,
      ...updateData
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id  Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await deleteDoc(doc(db, "tasks", id));
    
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// PATCH /api/tasks/:id/toggle  Toggle task completion status
router.patch("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ 
        error: "Completed field must be a boolean" 
      });
    }

    const taskRef = doc(db, "tasks", id);
    const updateData = {
      completed,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(taskRef, updateData);

    res.json({
      id,
      completed,
      updatedAt: updateData.updatedAt
    });
  } catch (error) {
    console.error("Error toggling task:", error);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

export default router;