import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCcq5MGnc2cVifz1wTi2aSngOn8Q0KyyBo",
    authDomain: "petpulse-b1a02.firebaseapp.com",
    projectId: "petpulse-b1a02",
    storageBucket: "petpulse-b1a02.firebasestorage.app",
    messagingSenderId: "868043579789",
    appId: "1:868043579789:web:dab13c0e47ee6273091dc4",
    measurementId: "G-WTQ39V2H67"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);