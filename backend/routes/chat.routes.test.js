import request from "supertest";
import express from "express";
import chatRouter from "./chat.routes.js"; // Adjust path if needed
import * as chatService from "../services/chat.service.js"; // Mocked

const app = express();
app.use(express.json());
app.use("/api", chatRouter);

jest.mock("../services/chat.service.js");

describe("Chat Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/chats/:chatId", () => {
    it("should return messages successfully", async () => {
      const chatId = "chat123";
      const mockMessages = [{ content: "Hi", senderId: "user1" }];
      chatService.getMessages.mockResolvedValueOnce(mockMessages);

      const res = await request(app).get(`/api/chats/${chatId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.messages).toEqual(mockMessages);
      expect(chatService.getMessages).toHaveBeenCalledWith(chatId);
    });

    it("should handle errors when getting messages", async () => {
      chatService.getMessages.mockRejectedValueOnce(new Error("DB fail"));

      const res = await request(app).get("/api/chats/chat123");

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Failed to get messages");
    });
  });

  describe("POST /api/chats/:chatId", () => {
    it("should send message successfully", async () => {
      const chatId = "chat456";
      const mockMessage = { senderId: "user1", content: "Hello" };
      chatService.sendMessage.mockResolvedValueOnce("msg789");

      const res = await request(app)
        .post(`/api/chats/${chatId}`)
        .send(mockMessage);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.msgId).toBe("msg789");
      expect(chatService.sendMessage).toHaveBeenCalledWith(chatId, mockMessage);
    });

    it("should handle errors when sending message", async () => {
      chatService.sendMessage.mockRejectedValueOnce(new Error("Send fail"));

      const res = await request(app)
        .post("/api/chats/chat456")
        .send({ senderId: "user1", content: "Hello" });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Failed to send message");
    });
  });
});