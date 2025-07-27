import request from "supertest";
import express from "express";
import socialRoutes from "./social.routes.js";
import * as SocialService from "../services/social.service.js";
import * as validation from "../request-validation.js";
import * as firestore from "firebase/firestore";

jest.mock("../firebase");
jest.mock("../services/social.service.js");
jest.mock("../request-validation.js");
jest.mock("firebase/firestore", () => {
  const original = jest.requireActual("firebase/firestore");
  return {
    ...original,
    doc: jest.fn(),
    getDoc: jest.fn(),
  };
});

const app = express();
app.use(express.json());
app.use("/api/social", socialRoutes);

describe("Social Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("GET /api/social/posts", () => {
    it("returns list of forum posts", async () => {
      const mockPosts = [{ id: "1", content: "test post" }];
      SocialService.getForumPosts.mockResolvedValue(mockPosts);

      const res = await request(app).get("/api/social/posts");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.posts).toEqual(mockPosts);
    });
  });

  describe("POST /api/social/posts", () => {
    it("creates a new forum post", async () => {
      const mockPost = { id: "newPost", content: "hello" };

      validation.validateRequestData.mockResolvedValue({
        userEmail: "test@example.com",
        content: "hello",
        userId: "uid1",
      });

      SocialService.createForumPost.mockResolvedValue(mockPost);

      const res = await request(app).post("/api/social/posts").send({
        userEmail: "test@example.com",
        content: "hello",
        userId: "uid1",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.content).toBe("hello");
    });

    it("returns 500 on invalid post", async () => {
      validation.validateRequestData.mockRejectedValue(new Error("Validation failed"));

      const res = await request(app).post("/api/social/posts").send({
        content: "missing fields",
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/social/posts/:id/like", () => {
    it("likes a forum post", async () => {
      const res = await request(app)
        .post("/api/social/posts/post123/like")
        .send({ userId: "uid1", isLiked: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(SocialService.likeForumPost).toHaveBeenCalledWith("post123", "uid1", true);
    });
  });

  describe("POST /api/social/posts/:id/comments", () => {
    it("adds a comment", async () => {
      SocialService.addForumComment.mockResolvedValue("comment123");

      const res = await request(app)
        .post("/api/social/posts/post1/comments")
        .send({ userId: "uid1", content: "nice post" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.commentId).toBe("comment123");
    });
  });

  describe("GET /api/social/search", () => {
    it("searches users by email", async () => {
      const mockUsers = [{ id: "u1", email: "hello@example.com" }];
      SocialService.searchUsersByEmail.mockResolvedValue(mockUsers);

      const res = await request(app).get("/api/social/search").query({
        query: "hello",
        userId: "uid1",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users).toEqual(mockUsers);
    });
  });

  describe("POST /api/social/follow", () => {
    it("follows a user", async () => {
      const res = await request(app).post("/api/social/follow").send({
        userId: "uid1",
        targetUserId: "uid2",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(SocialService.followUser).toHaveBeenCalledWith("uid1", "uid2");
    });
  });

  describe("POST /api/social/unfollow", () => {
    it("unfollows a user", async () => {
      const res = await request(app).post("/api/social/unfollow").send({
        userId: "uid1",
        targetUserId: "uid2",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(SocialService.unfollowUser).toHaveBeenCalledWith("uid1", "uid2");
    });
  });

  describe("GET /api/social/following", () => {
    it("returns following list", async () => {
      const mockUserData = {
        exists: () => true,
        data: () => ({ following: ["uid2"] }),
      };
      const mockOtherUser = {
        exists: () => true,
        id: "uid2",
        data: () => ({ email: "followed@example.com" }),
      };

      firestore.getDoc
        .mockResolvedValueOnce(mockUserData)
        .mockResolvedValueOnce(mockOtherUser);

      const res = await request(app).get("/api/social/following").query({ userId: "uid1" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.following.length).toBe(1);
    });
  });

  describe("GET /api/social/followers", () => {
    it("returns followers list", async () => {
      const mockUserData = {
        exists: () => true,
        data: () => ({ followers: ["uid3"] }),
      };
      const mockOtherUser = {
        exists: () => true,
        id: "uid3",
        data: () => ({ email: "follower@example.com" }),
      };

      firestore.getDoc
        .mockResolvedValueOnce(mockUserData)
        .mockResolvedValueOnce(mockOtherUser);

      const res = await request(app).get("/api/social/followers").query({ userId: "uid1" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.followers.length).toBe(1);
    });
  });

  describe("GET /api/social/followers", () => {
    it("returns followers list", async () => {
      const mockUserData = {
        exists: () => true,
        data: () => ({ followers: ["uid3"] }),
      };
      const mockOtherUser = {
        exists: () => true,
        id: "uid3",
        data: () => ({ email: "follower@example.com" }),
      };
  
      firestore.getDoc
        .mockResolvedValueOnce(mockUserData)
        .mockResolvedValueOnce(mockOtherUser);
  
      const res = await request(app).get("/api/social/followers").query({ userId: "uid1" });
  
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.followers.length).toBe(1);
    });
  
    it("returns 500 on firestore error", async () => {
      firestore.getDoc.mockRejectedValue(new Error("DB error"));
  
      const res = await request(app).get("/api/social/followers").query({ userId: "uid1" });
  
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
  
  describe("DELETE /api/social/posts/:id", () => {
    it("deletes a forum post successfully", async () => {
      SocialService.deleteForumPost.mockResolvedValue();
  
      const res = await request(app).delete("/api/social/posts/abc123");
  
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  
    it("returns 500 if deletion fails", async () => {
      SocialService.deleteForumPost.mockRejectedValue(new Error("Delete failed"));
  
      const res = await request(app).delete("/api/social/posts/abc123");
  
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
  
  describe("POST /api/social/posts/:id/comments", () => {
    it("adds a comment successfully", async () => {
      SocialService.addForumComment.mockResolvedValue("comment321");
  
      const res = await request(app)
        .post("/api/social/posts/post999/comments")
        .send({ content: "Nice post", userId: "uid1" });
  
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.commentId).toBe("comment321");
    });
  
    it("returns 500 if comment fails", async () => {
      SocialService.addForumComment.mockRejectedValue(new Error("fail"));
  
      const res = await request(app)
        .post("/api/social/posts/post999/comments")
        .send({ content: "fail test", userId: "uid1" });
  
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
  
  describe("POST /api/social/follow", () => {
    it("follows a user", async () => {
      const res = await request(app).post("/api/social/follow").send({
        userId: "uid1",
        targetUserId: "uid2"
      });
  
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(SocialService.followUser).toHaveBeenCalledWith("uid1", "uid2");
    });
  
    it("returns 500 on follow error", async () => {
      SocialService.followUser.mockRejectedValue(new Error("fail"));
  
      const res = await request(app).post("/api/social/follow").send({
        userId: "uid1",
        targetUserId: "uid2"
      });
  
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Failed to follow user");
    });
  });
  
  describe("POST /api/social/unfollow", () => {
    it("unfollows a user", async () => {
      const res = await request(app).post("/api/social/unfollow").send({
        userId: "uid1",
        targetUserId: "uid2"
      });
  
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(SocialService.unfollowUser).toHaveBeenCalledWith("uid1", "uid2");
    });
  
    it("returns 500 on unfollow error", async () => {
      SocialService.unfollowUser.mockRejectedValue(new Error("fail"));
  
      const res = await request(app).post("/api/social/unfollow").send({
        userId: "uid1",
        targetUserId: "uid2"
      });
  
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Failed to unfollow user");
    });
  });
  
  describe("GET /api/social/following", () => {
    it("returns following list", async () => {
      const mockUserData = {
        exists: () => true,
        data: () => ({ following: ["uid2"] })
      };
      const mockOtherUser = {
        exists: () => true,
        id: "uid2",
        data: () => ({ email: "followed@example.com" })
      };
  
      firestore.getDoc
        .mockResolvedValueOnce(mockUserData)
        .mockResolvedValueOnce(mockOtherUser);
  
      const res = await request(app).get("/api/social/following").query({ userId: "uid1" });
  
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.following.length).toBe(1);
    });
  
    it("returns 500 if fetching following fails", async () => {
      firestore.getDoc.mockRejectedValue(new Error("fail"));
  
      const res = await request(app).get("/api/social/following").query({ userId: "uid1" });
  
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Failed to get following");
    });
  });
  
  describe("POST /api/social/posts/:id/comments", () => {
    it("adds a comment successfully", async () => {
      SocialService.addForumComment.mockResolvedValue("commentABC");
  
      const res = await request(app)
        .post("/api/social/posts/post123/comments")
        .send({ content: "Great post!", userId: "uid1" });
  
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.commentId).toBe("commentABC");
    });
  
    it("returns 500 if addForumComment fails", async () => {
      SocialService.addForumComment.mockRejectedValue(new Error("Firestore error"));
  
      const res = await request(app)
        .post("/api/social/posts/post123/comments")
        .send({ content: "Error test", userId: "uid1" });
  
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Failed to add comment");
    });
  });
  
  describe("GET /api/social/posts/:id/comments", () => {
    it("fetches comments for a post", async () => {
      SocialService.getCommentsForPost.mockResolvedValue([
        { id: "c1", content: "Looks good!" },
      ]);
  
      const res = await request(app).get("/api/social/posts/post123/comments");
  
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.comments.length).toBe(1);
    });
  
    it("returns 500 if getCommentsForPost fails", async () => {
      SocialService.getCommentsForPost.mockRejectedValue(new Error("Error"));
  
      const res = await request(app).get("/api/social/posts/post123/comments");
  
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Failed to fetch comments");
    });
  });
  
  describe("GET /api/social/search", () => {
    it("returns matched users", async () => {
      SocialService.searchUsersByEmail.mockResolvedValue([
        { id: "uid1", email: "a@b.com" },
      ]);
  
      const res = await request(app).get("/api/social/search").query({
        query: "a",
        userId: "uid0",
      });
  
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users.length).toBe(1);
    });
  
    it("returns 500 on search error", async () => {
      SocialService.searchUsersByEmail.mockRejectedValue(new Error("Search failed"));
  
      const res = await request(app).get("/api/social/search").query({
        query: "a",
        userId: "uid0",
      });
  
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Search failed");
    });
  });
  
});