import express from "express";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { createPetSchema } from "../types/pets.js";
import { validateRequestData } from "../request-validation.js";

const router = express.Router();

// GET /api/pets
router.get("/", async (req, res) => {
  try {
    const petsCollection = collection(db, "Pets");
    const snapshot = await getDocs(petsCollection);
    const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/pets
router.post("/", async (req, res) => {
  try {
    const petData = req.body;
    console.log("Request Body:", petData); // Log the incoming data
    await validateRequestData(petData, createPetSchema);
    const petsCollection = collection(db, "Pets");
    const docRef = await addDoc(petsCollection, petData);
    res.status(201).json({ success: true, message: "Pet added!", id: docRef.id });
  } catch (error) {
    console.error("Error adding pet:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;