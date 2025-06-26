import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js";

// Get all pets for a specific user
export const getUserPets = async (userId) => {
  const petsCollection = collection(db, "pets");
  const filterByUser = query(petsCollection, where("userId", "==", userId));
  const snapshot = await getDocs(filterByUser);

  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
};

// Create a new pet entry
export const createPet = async (petData) => {
  const petsCollection = collection(db, "pets");
  const docRef = await addDoc(petsCollection, {
    ...petData,
    petId: doc(petsCollection).id // attach a generated ID (not used as doc ID)
  });

  return { id: docRef.id };
};

// Update an existing pet
export const updatePet = async (id, updateData) => {
  const petRef = doc(db, "pets", id);
  await updateDoc(petRef, updateData);
};

// Delete a pet
export const deletePet = async (id) => {
  const petRef = doc(db, "pets", id);
  await deleteDoc(petRef);
};