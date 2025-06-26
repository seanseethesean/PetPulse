import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
  import { db } from "../firebase.js";
  
  // Get all forum posts
  export const getForumPosts = async () => {
    const postsRef = collection(db, "forum");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
  
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  };
  
  // Create a new forum post
  export const createForumPost = async (postData) => {
    const data = {
      ...postData,
      createdAt: new Date().toISOString()
    };
  
    const docRef = await addDoc(collection(db, "forum"), data);
  
    return {
      id: docRef.id,
      ...data
    };
  };
  
  // Delete a forum post
  export const deleteForumPost = async (id) => {
    const postRef = doc(db, "forum", id);
    await deleteDoc(postRef);
  };
  