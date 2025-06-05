import express from "express";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase.js";
import { createPetSchema } from "../types/pets.js";
import { validateRequestData } from "../request-validation.js";

const router = express.Router();

// GET /api/pets
router.get("/", async (req, res) => {
  const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, error: "Missing userId" });
    }

  try {
    const petsCollection = collection(db, "Pets");
    const q = query(petsCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, pets });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/pets
router.post("/", async (req, res) => {
  const { name, breed, birthday, animalType, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }
  
  try {
    await addDoc(collection(db, "Pets"), {
      name,
      breed,
      birthday,
      animalType,
      userId,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error adding pet:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


export default router;