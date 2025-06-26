import express from "express";
import { signUpUser, verifyGoogleToken } from "../services/auth.service.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const result = await signUpUser(email, password);
    res.status(201).json(result);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.post("/login", (req, res) => {
  res.status(200).json({
    message: "Please use Firebase client SDK for login. This endpoint is for reference only."
  });
});

router.post("/google", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    const result = await verifyGoogleToken(idToken);
    res.status(200).json(result);
  } catch (err) {
    console.error("Google token verification error:", err);
    res.status(err.status || 401).json({ message: err.message });
  }
});

export default router;