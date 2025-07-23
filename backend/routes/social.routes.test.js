import { jest, describe, it, beforeEach, afterEach, expect } from "@jest/globals";
import request from "supertest";
import express from "express";

// calling mock firebase module
jest.unstable_mockModule("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn()
}));

import socialRoutes from "../routes/social.routes.js";
import * as socialService from "../services/social.service.js";
import * as validation from "../request-validation.js";
import { getDoc } from "firebase/firestore";

// Set up app
const app = express();
app.use(express.json());
app.use("/api/social", socialRoutes);

describe("Social Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /posts", () => {
    it("should return forum posts", async () => {
      const mockPosts = [{ id: 1, text: "Hello" }];
      jest.spyOn(socialService, "getForumPosts").mockResolvedValue(mockPosts);

      const res = await request(app).get("/api/social/posts");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.posts).toEqual(mockPosts);
    });

    it("should return 500 on error", async () => {
      jest.spyOn(socialService, "getForumPosts").mockRejectedValue(new Error("Fail"));

      const res = await request(app).get("/api/social/posts");
      expect(res.status).toBe(500);
    });
  });

  describe("POST /posts", () => {
    it("should create a post", async () => {
      const mockPost = { userId: "1", content: "Post" };
      const created = { id: "abc", ...mockPost };

      jest.spyOn(validation, "validateRequestData").mockResolvedValue(mockPost);
      jest.spyOn(socialService, "createForumPost").mockResolvedValue(created);

      const res = await request(app).post("/api/social/posts").send(mockPost);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.content).toBe("Post");
    });

    it("should return 500 on error", async () => {
      jest.spyOn(validation, "validateRequestData").mockRejectedValue(new Error("Invalid"));

      const res = await request(app).post("/api/social/posts").send({});
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /posts/:id", () => {
    it("should delete a post", async () => {
      jest.spyOn(socialService, "deleteForumPost").mockResolvedValue();

      const res = await request(app).delete("/api/social/posts/abc");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 500 on error", async () => {
      jest.spyOn(socialService, "deleteForumPost").mockRejectedValue(new Error("Fail"));

      const res = await request(app).delete("/api/social/posts/abc");
      expect(res.status).toBe(500);
    });
  });

  describe("POST /posts/:id/like", () => {
    it("should like/unlike a post", async () => {
      jest.spyOn(socialService, "likeForumPost").mockResolvedValue();

      const res = await request(app)
        .post("/api/social/posts/post123/like")
        .send({ userId: "user1", isLiked: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 500 on error", async () => {
      jest.spyOn(socialService, "likeForumPost").mockRejectedValue(new Error("Fail"));

      const res = await request(app)
        .post("/api/social/posts/post123/like")
        .send({ userId: "user1", isLiked: true });

      expect(res.status).toBe(500);
    });
  });

  describe("POST /posts/:id/comments", () => {
    it("should add a comment", async () => {
      jest.spyOn(socialService, "addForumComment").mockResolvedValue("comment123");

      const res = await request(app)
        .post("/api/social/posts/post123/comments")
        .send({ userId: "1", content: "Nice!" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.commentId).toBe("comment123");
    });

    it("should return 500 on error", async () => {
      jest.spyOn(socialService, "addForumComment").mockRejectedValue(new Error("Fail"));

      const res = await request(app)
        .post("/api/social/posts/post123/comments")
        .send({});

      expect(res.status).toBe(500);
    });
  });

  describe("GET /posts/:id/comments", () => {
    it("should get comments", async () => {
      const mockComments = [{ text: "Hi" }];
      jest.spyOn(socialService, "getCommentsForPost").mockResolvedValue(mockComments);

      const res = await request(app).get("/api/social/posts/post123/comments");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.comments).toEqual(mockComments);
    });

    it("should return 500 on error", async () => {
      jest.spyOn(socialService, "getCommentsForPost").mockRejectedValue(new Error("Fail"));

      const res = await request(app).get("/api/social/posts/post123/comments");
      expect(res.status).toBe(500);
    });
  });

  describe("GET /search", () => {
    it("should search users", async () => {
      const mockUsers = [{ email: "a@test.com" }];
      jest.spyOn(socialService, "searchUsersByEmail").mockResolvedValue(mockUsers);

      const res = await request(app).get("/api/social/search?query=a&userId=1");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users).toEqual(mockUsers);
    });

    it("should return 500 on error", async () => {
      jest.spyOn(socialService, "searchUsersByEmail").mockRejectedValue(new Error("Fail"));

      const res = await request(app).get("/api/social/search?query=a&userId=1");
      expect(res.status).toBe(500);
    });
  });

  describe("POST /follow", () => {
    it("should follow a user", async () => {
      jest.spyOn(socialService, "followUser").mockResolvedValue();

      const res = await request(app)
        .post("/api/social/follow")
        .send({ userId: "1", targetUserId: "2" });

      expect(res.status).toBe(200);
    });

    it("should return 500 on error", async () => {
      jest.spyOn(socialService, "followUser").mockRejectedValue(new Error("Fail"));

      const res = await request(app)
        .post("/api/social/follow")
        .send({ userId: "1", targetUserId: "2" });

      expect(res.status).toBe(500);
    });
  });

  describe("POST /unfollow", () => {
    it("should unfollow a user", async () => {
      jest.spyOn(socialService, "unfollowUser").mockResolvedValue();

      const res = await request(app)
        .post("/api/social/unfollow")
        .send({ userId: "1", targetUserId: "2" });

      expect(res.status).toBe(200);
    });

    it("should return 500 on error", async () => {
      jest.spyOn(socialService, "unfollowUser").mockRejectedValue(new Error("Fail"));

      const res = await request(app)
        .post("/api/social/unfollow")
        .send({ userId: "1", targetUserId: "2" });

      expect(res.status).toBe(500);
    });
  });

  describe("GET /following", () => {
    it("should return following users", async () => {
      getDoc.mockImplementation(async (ref) => {
        if (ref.id === "uid1") {
          return {
            exists: () => true,
            data: () => ({ following: ["uid2"] }),
          };
        }
        if (ref.id === "uid2") {
          return {
            exists: () => true,
            id: "uid2",
            data: () => ({ name: "Alice" }),
          };
        }
        return {
          exists: () => false,
          data: () => ({}),
        };
      });
  
      const res = await request(app).get("/api/social/following?userId=uid1");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.following).toEqual([{ id: "uid2", name: "Alice" }]);
    });
  });

  describe("GET /followers", () => {
    it("should return followers", async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ followers: ["uid3"] }),
      });
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: "uid3",
        data: () => ({ name: "Bob" }),
      });

      const res = await request(app).get("/api/social/followers?userId=uid1");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.followers).toEqual([{ id: "uid3", name: "Bob" }]);
    });
  });
});
