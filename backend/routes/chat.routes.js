import express from "express";
import { getMessages, sendMessage } from "../services/chat.service.js";

const router = express.Router();

router.get("/chats/:chatId", async (req, res) => {
  try {
    const messages = await getMessages(req.params.chatId);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to get messages" });
  }
});

router.post("/chats/:chatId", async (req, res) => {
  try {
    const msgId = await sendMessage(req.params.chatId, req.body);
    res.status(201).json({ success: true, msgId });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

export default router;