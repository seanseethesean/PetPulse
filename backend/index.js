import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import petRoutes from "./routes/pet.routes.js";
import taskRoutes from "./routes/task.routes.js";
import expenseRoutes from "./routes/expenses.routes.js";
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

// Routes
app.use("/api/pets", petRoutes);  // prefix all routes inside with /api/pets
app.use("/api/tasks", taskRoutes);
app.use("/api/expenses", expenseRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});