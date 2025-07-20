import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../firebase.js";
import { where, updateDoc, arrayUnion, arrayRemove, increment, getDoc, setDoc } from "firebase/firestore";

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
      likes: 0, 
      likedBy: [],
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
  
  // Like/unlike a post
export const likeForumPost = async (postId, userId, isLiked) => {
  const postRef = doc(db, "forum", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) throw new Error("Post not found");

  const updates = {
    likes: increment(isLiked ? 1 : -1),
    likedBy: isLiked ? arrayUnion(userId) : arrayRemove(userId)
  };
  await updateDoc(postRef, updates);
};

// Add a comment
export const addForumComment = async (postId, commentData) => {
  const commentRef = doc(collection(db, `forum/${postId}/comments`));
  await setDoc(commentRef, commentData);
  return commentRef.id;
};

// Get comments
export const getCommentsForPost = async (postId) => {
  const commentsRef = collection(db, `forum/${postId}/comments`);
  const snapshot = await getDocs(commentsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Search function
export const searchUsersByEmail = async (searchQuery, userIdToExclude = null) => {
  try {
  const usersRef = collection(db, "users");

  const q = query(
    usersRef,
    where("displayName", ">=", searchQuery),
    where("displayName", "<=", searchQuery + "\uf8ff")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .filter(doc => doc.id !== userIdToExclude)
    .map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    throw new Error("Search failed");
  }
};

// follow
export const followUser = async (userId, targetUserId) => {
  const userRef = doc(db, "users", userId);
  const targetRef = doc(db, "users", targetUserId);

  await updateDoc(userRef, {
    following: arrayUnion(targetUserId)
  });

  await updateDoc(targetRef, {
    followers: arrayUnion(userId)
  });
};

// unfollow 
export const unfollowUser = async (userId, targetUserId) => {
  const userRef = doc(db, "users", userId);
  const targetRef = doc(db, "users", targetUserId);

  await updateDoc(userRef, {
    following: arrayRemove(targetUserId)
  });

  await updateDoc(targetRef, {
    followers: arrayRemove(userId)
  });
};