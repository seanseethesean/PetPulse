import express from "express";
<<<<<<< Updated upstream
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
=======
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
>>>>>>> Stashed changes
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
    const { userId } = req.query

    if (!userId) {
      throw Error("no userId bro")
    }
 
    const petsCollection = collection(db, "Pets");
<<<<<<< Updated upstream
    const q = query(petsCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
=======
    const snapshot = await getDocs(petsCollection); // filter documents by UID!!!!!!!
>>>>>>> Stashed changes
    const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, pets });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// create another route for indiv user; filters where u.id = the value 

// POST /api/pets
router.post("/", async (req, res) => {
  const { name, breed, birthday, animalType, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }
  
  try {
<<<<<<< Updated upstream
    await addDoc(collection(db, "Pets"), {
      name,
      breed,
      birthday,
      animalType,
      userId,
    });

    res.status(200).json({ success: true });
=======
    const petData = req.body;
    console.log("Request Body:", petData); // Log the incoming data
    await validateRequestData(petData, createPetSchema);
    const petsCollection = collection(db, "Pets");
    const docId = doc(petsCollection).id
    const docRef = await addDoc(petsCollection, { ...petData, petId: docId }); // spread operator
    res.status(201).json({ success: true, message: "Pet added!", id: docRef.id });
>>>>>>> Stashed changes
  } catch (error) {
    console.error("Error adding pet:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

<<<<<<< Updated upstream
=======
// PUT /api/pets/:id  →  update an existing pet
router.put("/:id", async (req, res) => {
  try {
    const petData = req.body;
    await validateRequestData(petData, createPetSchema);

    const petRef = doc(db, "Pets", req.params.id);
    await updateDoc(petRef, petData);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating pet:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE 
router.delete("/:id", async (req, res) => {
  try {
    const petRef = doc(db, "Pets", req.params.id);
    await deleteDoc(petRef);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting pet:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
>>>>>>> Stashed changes

export default router;