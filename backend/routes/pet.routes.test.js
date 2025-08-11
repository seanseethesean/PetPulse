import request from "supertest";
import express from "express";
import petRoutes from "../routes/pet.routes.js";
import * as petService from "../services/pet.service.js";
import * as validation from "../request-validation.js";
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

jest.mock("../firebase");
const app = express();
app.use(express.json());
app.use("/api/pets", petRoutes);

describe("Pet Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/pets", () => {
    it("should return 400 if userId is missing", async () => {
      const res = await request(app).get("/api/pets");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Missing userId");
    });

    it("should return pets for valid userId", async () => {
      const mockPets = [{ name: "Buddy" }];
      jest.spyOn(petService, "getUserPets").mockResolvedValue(mockPets);

      const res = await request(app).get("/api/pets?userId=123");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pets).toEqual(mockPets);
    });

    it("should return 500 on fetch error", async () => {
      jest.spyOn(petService, "getUserPets").mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/pets?userId=123");
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("DB error");
    });
  });

  describe("POST /api/pets", () => {
    it("should return 400 if userId is missing", async () => {
      const res = await request(app).post("/api/pets").send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Missing userId");
    });

    it("should create a new pet", async () => {
      const newPet = { userId: "123", name: "Rex" };
      const createdPet = { id: "abc", ...newPet };

      jest.spyOn(validation, "validateRequestData").mockResolvedValue(newPet);
      jest.spyOn(petService, "createPet").mockResolvedValue(createdPet);

      const res = await request(app).post("/api/pets").send(newPet);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Pet added!");
      expect(res.body.name).toBe("Rex");
    });

    it("should return 500 if creation fails", async () => {
      jest.spyOn(validation, "validateRequestData").mockResolvedValue({});
      jest.spyOn(petService, "createPet").mockRejectedValue(new Error("Creation failed"));

      const res = await request(app).post("/api/pets").send({ userId: "123" });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Creation failed");
    });
  });

  describe("PUT /api/pets/:id", () => {
    it("should update a pet successfully", async () => {
      const updatedPet = { name: "Updated Rex" };

      jest.spyOn(validation, "validateRequestData").mockResolvedValue(updatedPet);
      jest.spyOn(petService, "updatePet").mockResolvedValue();

      const res = await request(app).put("/api/pets/abc123").send(updatedPet);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 500 if update fails", async () => {
      jest.spyOn(validation, "validateRequestData").mockResolvedValue({});
      jest.spyOn(petService, "updatePet").mockRejectedValue(new Error("Update failed"));

      const res = await request(app).put("/api/pets/abc123").send({});
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Update failed");
    });
  });

  describe("DELETE /api/pets/:id", () => {
    it("should delete a pet successfully", async () => {
      jest.spyOn(petService, "deletePet").mockResolvedValue();

      const res = await request(app).delete("/api/pets/abc123");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 500 if deletion fails", async () => {
      jest.spyOn(petService, "deletePet").mockRejectedValue(new Error("Delete failed"));

      const res = await request(app).delete("/api/pets/abc123");
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Delete failed");
    });
  });
});