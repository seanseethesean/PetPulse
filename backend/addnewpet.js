// PetMgmBackend.js
// Direct Firebase SDK integration for Pet Management

import { getAuth } from "firebase/auth";
import { 
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db, storage } from "firebase.js";


// Add new pet to Firestore under current user UID
export const addNewPet = async (formData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not signed in");

    const petData = {
      ...formData,
      imageURL,
      userId: user.uid,
    };

    await addDoc(collection(db, "pets"), petData); 
    return { success: true };
  } catch (err) {
    console.error("Error adding pet:", err);
    return { success: false, error: err };
  }
};

// Fetch pets associated with a specific user UID
export const fetchUserPets = async (uid) => {
  const q = query(collection(db, "pets"), where("userId", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Optional: observe user auth and refetch pets
export const observePetsByAuth = (setPetList) => {
  const auth = getAuth();
  return auth.onAuthStateChanged(async (user) => {
    if (user) {
      const pets = await fetchUserPets(user.uid);
      setPetList(pets);
    }
  });
};