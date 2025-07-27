import request from "supertest";
import express from "express";
import tasksRoutes from "./tasks.routes.js";
import * as tasksService from "../services/tasks.service.js";
import * as validation from "../request-validation.js";
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

jest.mock("../firebase");
const app = express();
app.use(express.json());
app.use("/api/tasks", tasksRoutes);

describe("Tasks Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/tasks", () => {
    it("should return 400 if date is missing", async () => {
      const res = await request(app).get("/api/tasks?userId=123");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Date parameter is required (format: YYYY-MM-DD)");
    });

    it("should return 400 if userId is missing", async () => {
      const res = await request(app).get("/api/tasks?date=2025-07-01");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("UserId parameter is required");
    });

    it("should return tasks if date and userId are provided", async () => {
      const mockTasks = [{ id: "t1", title: "Walk dog" }];
      jest.spyOn(tasksService, "getTasks").mockResolvedValue(mockTasks);

      const res = await request(app).get("/api/tasks?date=2025-07-01&userId=123");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTasks);
    });

    it("should return 500 if service throws", async () => {
      jest.spyOn(tasksService, "getTasks").mockRejectedValue(new Error("Failed"));

      const res = await request(app).get("/api/tasks?date=2025-07-01&userId=123");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to fetch tasks");
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a task successfully", async () => {
      const mockTask = { title: "Feed cat" };
      const createdTask = { id: "1", ...mockTask };

      jest.spyOn(validation, "validateRequestData").mockResolvedValue(mockTask);
      jest.spyOn(tasksService, "createTask").mockResolvedValue(createdTask);

      const res = await request(app).post("/api/tasks").send(mockTask);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(createdTask);
    });

    it("should return 500 if creation fails", async () => {
      jest.spyOn(validation, "validateRequestData").mockRejectedValue(new Error("Invalid"));

      const res = await request(app).post("/api/tasks").send({});
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to create task");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update a task successfully", async () => {
      const mockUpdate = { title: "Updated Task" };
      const updatedTask = { id: "1", ...mockUpdate };

      jest.spyOn(validation, "validateRequestData").mockResolvedValue(mockUpdate);
      jest.spyOn(tasksService, "updateTask").mockResolvedValue(updatedTask);

      const res = await request(app).put("/api/tasks/1").send(mockUpdate);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedTask);
    });

    it("should return 500 if update fails", async () => {
      jest.spyOn(validation, "validateRequestData").mockResolvedValue({});
      jest.spyOn(tasksService, "updateTask").mockRejectedValue(new Error("Update error"));

      const res = await request(app).put("/api/tasks/1").send({});
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to update task");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      jest.spyOn(tasksService, "deleteTask").mockResolvedValue();

      const res = await request(app).delete("/api/tasks/123");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Task deleted successfully");
    });

    it("should return 500 if delete fails", async () => {
      jest.spyOn(tasksService, "deleteTask").mockRejectedValue(new Error("Delete error"));

      const res = await request(app).delete("/api/tasks/123");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to delete task");
    });
  });

  describe("PATCH /api/tasks/:id/toggle", () => {
    it("should toggle completion successfully", async () => {
      const updated = { id: "1", completed: true };
      jest.spyOn(tasksService, "toggleTaskCompletion").mockResolvedValue(updated);

      const res = await request(app).patch("/api/tasks/1/toggle").send({ completed: true });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
    });

    it("should return 400 if completed is not boolean", async () => {
      const res = await request(app).patch("/api/tasks/1/toggle").send({ completed: "yes" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Completed field must be a boolean");
    });

    it("should return 500 if toggle fails", async () => {
      jest.spyOn(tasksService, "toggleTaskCompletion").mockRejectedValue(new Error("Toggle fail"));

      const res = await request(app).patch("/api/tasks/1/toggle").send({ completed: false });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to toggle task");
    });
  });
});
