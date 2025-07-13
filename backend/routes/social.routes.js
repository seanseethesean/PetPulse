import express from "express";
import { getForumPosts, createForumPost, deleteForumPost } from "../services/social.service.js";
import { validateRequestData } from "../request-validation.js";
import { createForumPostSchema } from "../types/social.types.js";
import { likeForumPost, addForumComment, getCommentsForPost } from "../services/social.service.js";

const router = express.Router();

// GET: Fetch all forum posts
router.get("/posts", async (req, res) => {
  try {
    const posts = await getForumPosts();
    res.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch posts" });
  }
});

// POST: Create a new forum post
router.post("/posts", async (req, res) => {
  try {
    const validated = await validateRequestData(req.body, createForumPostSchema);
    const createdPost = await createForumPost(validated);
    res.status(201).json({ success: true, ...createdPost });
  } catch (error) {
    console.error("Error creating forum post:", error);
    res.status(500).json({ success: false, error: "Failed to create post" });
  }
});

// DELETE: Delete a forum post by ID
router.delete("/posts/:id", async (req, res) => {
  try {
    await deleteForumPost(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting forum post:", error);
    res.status(500).json({ success: false, error: "Failed to delete post" });
  }
});

// Like/Unlike a post
router.post("/posts/:id/like", async (req, res) => {
  const { userId, isLiked } = req.body;
  try {
    await likeForumPost(req.params.id, userId, isLiked);
    res.json({ success: true });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ success: false, error: "Failed to like/unlike post" });
  }
});

// Add a comment to a post
router.post("/posts/:id/comments", async (req, res) => {
  const comment = req.body;
  try {
    const commentId = await addForumComment(req.params.id, comment);
    res.status(201).json({ success: true, commentId });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, error: "Failed to add comment" });
  }
});

// get the comments for post 
router.get("/posts/:id/comments", async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await getCommentsForPost(postId);
    res.json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, error: "Failed to fetch comments" });
  }
});

export default router;