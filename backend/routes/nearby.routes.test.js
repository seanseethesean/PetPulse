import request from "supertest";
import express from "express";
import nearbyRoutes from "../routes/nearby.routes.js";
import * as nearbyService from "../services/nearby.service.js";
import * as validation from "../types/nearby.types.js";
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

// Setup test app
const app = express();
app.use(express.json());
app.use("/api/nearby", nearbyRoutes);

describe("Nearby Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/nearby", () => {
    it("should return 200 and places on valid request", async () => {
      // Mock middleware to pass through
      jest.spyOn(validation, "validateNearbyRequest").mockImplementation((req, res, next) => next());

      const mockPlaces = [{ name: "Park", location: "123 Road" }];
      jest.spyOn(nearbyService, "fetchNearbyPlaces").mockResolvedValue(mockPlaces);

      const res = await request(app).post("/api/nearby").send({ lat: 1.234, lon: 103.456 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results).toEqual(mockPlaces);
    });

    it("should return 500 if fetchNearbyPlaces throws", async () => {
      jest.spyOn(validation, "validateNearbyRequest").mockImplementation((req, res, next) => next());
      jest.spyOn(nearbyService, "fetchNearbyPlaces").mockRejectedValue(new Error("API error"));

      const res = await request(app).post("/api/nearby").send({ lat: 1.23, lon: 4.56 });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to fetch places");
    });

    it("should return 400 if validateNearbyRequest blocks the request", async () => {
      jest
        .spyOn(validation, "validateNearbyRequest")
        .mockImplementation((req, res, next) =>
          res.status(400).json({ error: "Invalid request" })
        );

      const res = await request(app).post("/api/nearby").send({}); // Missing lat/lon

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid request");
    });
  });
});