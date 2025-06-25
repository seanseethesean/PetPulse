import express from "express";
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../firebase.js";
import { validateRequestData } from "../request-validation.js";
import { createForumPostSchema } from "../types/social.types.js";


const router = express.Router();


// GET: Fetch all forum posts (accessible to all users)
router.get("/posts", async (req, res) => {
 try {
   const postsRef = collection(db, "forum");
   const q = query(postsRef, orderBy("createdAt", "desc"));
   const snapshot = await getDocs(q);


   const posts = snapshot.docs.map(doc => ({
     id: doc.id,
     ...doc.data()
   }));


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
   const postData = {
     ...validated,
     createdAt: new Date().toISOString(),
    //  updatedAt: new Date().toISOString(),
   };


   const docRef = await addDoc(collection(db, "forum"), postData);


   res.status(201).json({
     success: true,
     id: docRef.id,
     ...postData
   });
 } catch (error) {
   console.error("Error creating forum post:", error);
   res.status(500).json({ success: false, error: "Failed to create post" });
 }
});


// DELETE: Delete a forum post by ID
router.delete("/posts:id", async (req, res) => {
 try {
   const postRef = doc(db, "forum", req.params.id);
   await deleteDoc(postRef);


   res.json({ success: true });
 } catch (error) {
   console.error("Error deleting forum post:", error);
   res.status(500).json({ success: false, error: "Failed to delete post" });
 }
});


export default router;
