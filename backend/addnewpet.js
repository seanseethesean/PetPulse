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
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { db, storage } from "firebase.js";

// Upload image to Firebase Storage and return its URL
export const uploadPetImage = async (imageFile) => {
  const imageRef = ref(storage, `pets/${Date.now()}_${imageFile.name}`);
  await uploadBytes(imageRef, imageFile);
  return await getDownloadURL(imageRef);
};

// Add new pet to Firestore under current user UID
export const addNewPet = async (formData, imageFile) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not signed in");

    let imageURL = "";
    if (imageFile) {
      imageURL = await uploadPetImage(imageFile);
    }

    const petData = {
      ...formData,
      imageURL,
      uid: user.uid,
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
  const q = query(collection(db, "pets"), where("uid", "==", uid));
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