import express from "express";
import { getTasks, createTask, updateTask, deleteTask, toggleTaskCompletion } from "../services/tasks.service.js";
import { validateRequestData } from "../request-validation.js";
import { createTaskSchema, updateTaskSchema } from "../types/tasks.types.js";

const router = express.Router();

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const { date, userId } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required (format: YYYY-MM-DD)" });
    }
    if (!userId) {
      return res.status(400).json({ error: "UserId parameter is required" });
    }

    const tasks = await getTasks(date, userId);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST /api/tasks
router.post("/", async (req, res) => {
  try {
    const validated = await validateRequestData(req.body, createTaskSchema);
    const createdTask = await createTask(validated);
    res.status(201).json(createdTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PUT /api/tasks/:id
router.put("/:id", async (req, res) => {
  try {
    const validated = await validateRequestData(req.body, updateTaskSchema);
    const updatedTask = await updateTask(req.params.id, validated);
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    await deleteTask(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// PATCH /api/tasks/:id/toggle
router.patch("/:id/toggle", async (req, res) => {
  try {
    const { completed } = req.body;
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Completed field must be a boolean" });
    }

    const toggledTask = await toggleTaskCompletion(req.params.id, completed);
    res.json(toggledTask);
  } catch (error) {
    console.error("Error toggling task:", error);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

export default router;
