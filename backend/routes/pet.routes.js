import express from "express";
import { getUserPets, createPet, updatePet, deletePet } from "../services/pet.service.js";
import { createPetSchema } from "../types/pets.types.js";
import { validateRequestData } from "../request-validation.js";

const router = express.Router();

// GET /api/pets
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  try {
    const pets = await getUserPets(userId);
    res.status(200).json({ success: true, pets });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/pets
router.post("/", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  try {
    const validated = await validateRequestData(req.body, createPetSchema);
    const newPet = await createPet(validated);
    res.status(201).json({ success: true, message: "Pet added!", ...newPet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/pets/:id
router.put("/:id", async (req, res) => {
  try {
    const validated = await validateRequestData(req.body, createPetSchema);
    await updatePet(req.params.id, validated);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating pet:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/pets/:id
router.delete("/:id", async (req, res) => {
  try {
    await deletePet(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting pet:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;