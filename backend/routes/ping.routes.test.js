import request from "supertest";
import express from "express";
import pingRoutes from "./ping.routes.js"; // adjust the path as needed
import { describe, it, expect } from "@jest/globals";

// Setup a minimal app
const app = express();
app.use("/api/ping", pingRoutes);

describe("Ping Route", () => {
  it("should return pong on GET /api/ping", async () => {
    const res = await request(app).get("/api/ping");
    expect(res.status).toBe(200);
    expect(res.text).toBe("pong");
  });
});
