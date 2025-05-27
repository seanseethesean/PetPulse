import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyB-xvafDSofr7mzkgfy3ZMjBxRFeeu9sgs",
    authDomain: "petpulse-bbbec.firebaseapp.com",
    projectId: "petpulse-bbbec",
    storageBucket: "petpulse-bbbec.firebasestorage.app",
    messagingSenderId: "1058132065929",
    appId: "1:1058132065929:web:02a0b86c46515e113c9058",
    measurementId: "G-30B19F5X7E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// const analytics = getAnalytics(app);