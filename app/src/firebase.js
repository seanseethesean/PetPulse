// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// const analytics = getAnalytics(app);