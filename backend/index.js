import express from "express";
import cors from "cors";
import petRoutes from "./routes/pet.routes.js";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
    res.send("Backend server is running!");
});
  
// Use the pet routes
app.use("/api/Pets", petRoutes);  // ⬅️ prefix all routes inside with /api/pets

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});