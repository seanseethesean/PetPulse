import request from "supertest";
import express from "express";
import router from "./social.routes.js";
import * as socialService from "../services/social.service.js";
import * as validation from "../request-validation.js";
import { doc, getDoc } from "firebase/firestore";

// Mock Firebase functions
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("../firebase.js", () => ({
  db: {},
}));

// Mock social service
jest.mock("../services/social.service.js");

const app = express();
app.use(express.json());
app.use("/api/social", router);

describe("Social Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /posts should return all forum posts", async () => {
    socialService.getForumPosts.mockResolvedValue([{ id: "1", title: "Test Post" }]);

    const res = await request(app).get("/api/social/posts");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.posts)).toBe(true);
  });

  test("POST /posts should create a new forum post", async () => {
    jest.spyOn(validation, "validateRequestData").mockResolvedValue({
      title: "New Post",
      userId: "uid",
    });
    socialService.createForumPost.mockResolvedValue({ id: "1", title: "New Post" });

    const res = await request(app)
      .post("/api/social/posts")
      .send({ title: "New Post", userId: "uid" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe("1");
  });

  test("POST /posts/:id/like should like or unlike a post", async () => {
    socialService.likeForumPost.mockResolvedValue();

    const res = await request(app)
      .post("/api/social/posts/123/like")
      .send({ userId: "u1", isLiked: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /posts/:id/comments should add a comment", async () => {
    socialService.addForumComment.mockResolvedValue("comment123");

    const res = await request(app)
      .post("/api/social/posts/abc/comments")
      .send({ userId: "u1", content: "Nice post!" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.commentId).toBe("comment123");
  });

  test("GET /search should return matching users", async () => {
    socialService.searchUsersByEmail.mockResolvedValue([
      { id: "u2", email: "x@example.com" },
    ]);

    const res = await request(app).get("/api/social/search").query({ query: "x", userId: "u1" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  test("POST /follow should follow a user", async () => {
    socialService.followUser.mockResolvedValue();

    const res = await request(app)
      .post("/api/social/follow")
      .send({ userId: "u1", targetUserId: "u2" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /unfollow should unfollow a user", async () => {
    socialService.unfollowUser.mockResolvedValue();

    const res = await request(app)
      .post("/api/social/unfollow")
      .send({ userId: "u1", targetUserId: "u2" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});