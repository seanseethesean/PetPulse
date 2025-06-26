import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase.js";

// Get journal entries by user and pet
export const getJournalEntries = async (userId, petName) => {
  const journalRef = collection(db, "journal");

  const q = petName !== "all"
    ? query(
        journalRef,
        where("userId", "==", userId),
        where("petName", "==", petName),
        orderBy("createdAt", "desc")
      )
    : query(
        journalRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
};

// Create a new journal entry
export const createJournalEntry = async (entryData) => {
  const data = {
    ...entryData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, "journal"), data);
  return { id: docRef.id, ...data };
};

// Update an existing journal entry
export const updateJournalEntry = async (id, updateData) => {
  const entryRef = doc(db, "journal", id);
  await updateDoc(entryRef, updateData);
};

// Delete a journal entry
export const deleteJournalEntry = async (id) => {
  const entryRef = doc(db, "journal", id);
  await deleteDoc(entryRef);
};  