import express from "express";
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from "../services/journal.service.js";
import { createJournalSchema, updateJournalSchema } from "../types/journal.types.js";
import { validateRequestData } from "../request-validation.js";

const router = express.Router();

// GET: Fetch all journal entries for a pet
router.get("/", async (req, res) => {
  try {
    const { userId, petName } = req.query;

    if (!userId || !petName) {
      return res.status(400).json({ success: false, error: "Missing userId or petName" });
    }

    const entries = await getJournalEntries(userId, petName);
    res.json({ success: true, entries });
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// POST: Create new journal entry
router.post("/", async (req, res) => {
  try {
    const validated = await validateRequestData(req.body, createJournalSchema);
    const createdEntry = await createJournalEntry(validated);
    res.status(201).json({ success: true, ...createdEntry });
  } catch (error) {
    console.error("Error creating entry:", error);
    res.status(500).json({ error: "Failed to create entry" });
  }
});

// PUT: Update existing journal entry
router.put("/:id", async (req, res) => {
  try {
    const validated = await validateRequestData(req.body, updateJournalSchema);
    await updateJournalEntry(req.params.id, validated);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating journal entry:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Delete journal entry
router.delete("/:id", async (req, res) => {
  try {
    await deleteJournalEntry(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting journal entry:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;