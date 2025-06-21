import express from "express";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase.js";
import { createJournalSchema, updateJournalSchema } from "../types/journal.js";
import { validateRequestData } from "../request-validation.js";

const router = express.Router()

// GET: Fetch all journal entries for a pet
router.get("/", async (req, res) => {
    try {
    const { userId, petId } = req.query
  
    if (!userId || !petId) {
      return res.status(400).json({ success: false, error: "Missing userId or petName" })
    }
  
    // try {
    //   const journalRef = collection(db, "JournalEntries")
    //   const q = query(
    //     journalRef,
    //     where("userId", "==", userId),
    //     where("petName", "==", petName)
    //   )
    //   const snapshot = await getDocs(q)
    //   const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
    //   res.json({ success: true, entries })
    // } catch (err) {
    //   console.error("Error fetching journal entries:", err)
    //   res.status(500).json({ success: false, error: err.message })
    // }

  // Create query to get expenses for specific user
      const journalRef = collection(db, "journal");
      let q;
      
      if (petId && petId !== 'all') {
        q = query(
          journalRef, 
          where("userId", "==", userId),
          where("petId", "==", petId),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          journalRef, 
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
      }
  
      const querySnapshot = await getDocs(q);
      const entries = [];
      querySnapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      res.json({ success: true, entries });
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
});

   // POST /api/journal - Create new journal entry
  router.post("/", async (req, res) => {
    try {
      const validated = await validateRequestData(req.body, createJournalSchema)
      const entryData = {
        ...validated,
        createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()

      };

    // Save to firestore
    const docRef = await addDoc(collection(db, "journal"), entryData);
    
    // Respond to frontend
    res.status(201).json({
        success: true,
      id: docRef.id,
      ...entryData
    });
  } catch (error) {
    console.error("Error creating entry:", error);
    res.status(500).json({ error: "Failed to create entry" });
  }
  })
  
  // PUT: Update existing journal entry
  router.put("/:id", async (req, res) => {
    try {
      const entryData = req.body
      await validateRequestData(entryData, updateJournalSchema)
  
      const entryRef = doc(db, "journal", req.params.id)
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
      const entryRef = doc(db, "journal", req.params.id)
      await deleteDoc(entryRef)
  
      res.json({ success: true })
    } catch (err) {
      console.error("Error deleting journal entry:", err)
      res.status(500).json({ success: false, error: err.message })
    }
  })
  
  export default router

