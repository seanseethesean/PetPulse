import express from "express";
import { validateNearbyRequest } from "../types/nearby.types.js";
import { fetchNearbyPlaces } from "../services/nearby.service.js";

const router = express.Router();

router.post("/", validateNearbyRequest, async (req, res) => {
  const { lat, lon } = req.body;

  try {
    const places = await fetchNearbyPlaces(lat, lon);
    res.status(200).json({ success: true, results: places });
  } catch (err) {
    console.error("Error from Google Places API:", err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

export default router;