import express from "express";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { createPetSchema } from "../types/journal.js";
import { validateRequestData } from "../request-validation.js";

const router = express.Router()

// GET: Fetch all journal entries for a pet
router.get("/", async (req, res) => {
    const { userId, petName } = req.query
  
    if (!userId || !petName) {
      return res.status(400).json({ success: false, error: "Missing userId or petName" })
    }
  
    try {
      const journalRef = collection(db, "JournalEntries")
      const q = query(
        journalRef,
        where("userId", "==", userId),
        where("petName", "==", petName)
      )
      const snapshot = await getDocs(q)
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
      res.json({ success: true, entries })
    } catch (err) {
      console.error("Error fetching journal entries:", err)
      res.status(500).json({ success: false, error: err.message })
    }
  })
  
  // POST: Create new journal entry
  router.post("/", async (req, res) => {
    try {
      const entryData = req.body
      await validateRequestData(entryData, createJournalSchema)
  
      const journalRef = collection(db, "JournalEntries")
      const docRef = await addDoc(journalRef, entryData)
  
      res.status(201).json({ success: true, id: docRef.id })
    } catch (err) {
      console.error("Error adding journal entry:", err)
      res.status(500).json({ success: false, error: err.message })
    }
  })
  
  // PUT: Update existing journal entry
  router.put("/:id", async (req, res) => {
    try {
      const entryData = req.body
      await validateRequestData(entryData, createJournalSchema)
  
      const entryRef = doc(db, "JournalEntries", req.params.id)
      await updateDoc(entryRef, entryData)
  
      res.json({ success: true })
    } catch (err) {
      console.error("Error updating journal entry:", err)
      res.status(500).json({ success: false, error: err.message })
    }
  })
  
  // DELETE: Delete journal entry
  router.delete("/:id", async (req, res) => {
    try {
      const entryRef = doc(db, "JournalEntries", req.params.id)
      await deleteDoc(entryRef)
  
      res.json({ success: true })
    } catch (err) {
      console.error("Error deleting journal entry:", err)
      res.status(500).json({ success: false, error: err.message })
    }
  })
  
  export default router