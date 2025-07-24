import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import petRoutes from "./routes/pet.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import expenseRoutes from "./routes/expenses.routes.js";
import journalRoutes from "./routes/journal.routes.js";
// import forumRoutes from "./routes/social.routes.js";
import pingRoute from "./routes/ping.routes.js";
import nearbyRoutes from "./routes/nearby.routes.js";
// import searchRoutes from "./routes/social.routes.js";
import socialRoutes from "./routes/social.routes.js";;
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
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);  // prefix all routes inside with /api/pets
app.use("/api/tasks", taskRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/journal", journalRoutes);
// app.use("/api/forum", forumRoutes);
app.use("/ping", pingRoute);
app.use("/api/nearby", nearbyRoutes);
app.use("/api/users", socialRoutes);
app.use("/api/forum", socialRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});