import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import petRoutes from "./routes/pet.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import expenseRoutes from "./routes/expenses.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import pingRoute from "./routes/ping.routes.js";
import nearbyRoutes from "./routes/nearby.routes.js";
import socialRoutes from "./routes/social.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { sendMessage } from "./services/chat.service.js";
dotenv.config(); // Load environment variables from .env file

const app = express();
const server = http.createServer(app); // wrap express app

const io = new Server(server, {
  cors: {
    origin: "https://pet-pulse.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  }
}); 

const PORT = process.env.PORT;

// Middleware
const allowedOrigins = ['http://localhost:3000', 'https://pet-pulse.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
  
    socket.on("sendMessage", async (message) => {
      console.log("Socket message received:", message);
    
      const { chatId, ...rest } = message;
    
      try {
        const msgId = await sendMessage(chatId, rest);

        socket.broadcast.emit("receiveMessage", {
          ...rest,
          chatId,
          id: msgId
        });
      } catch (err) {
        console.error("Failed to save message:", err);
      }
    });
  
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });  

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
app.use("/ping", pingRoute);
app.use("/api/nearby", nearbyRoutes);
app.use("/api/users", socialRoutes);
app.use("/api/forum", socialRoutes);
app.use("/api", socialRoutes);
app.use("/api", chatRoutes);

// Start the server
server.listen(PORT, () => {
  console.log(`Server (with Socket.IO) running on http://localhost:${PORT}`);
});