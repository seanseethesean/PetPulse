import admin from "../firebase.js";
import { db } from "../firebase.js";
import { doc, setDoc, getDoc } from "firebase/firestore";

jest.mock("../firebase");
// Create user document if it doesn't exist
const createUserDocIfNotExists = async (uid, email) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      email,
      displayName: email.split('@')[0],
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    });
  }
};

// Sign up new user
export const signUpUser = async (email, password) => {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false
    });
    await createUserDocIfNotExists(userRecord.uid, userRecord.email);

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      message: "User created successfully"
    };
  } catch (err) {
    const errorMap = {
      "auth/email-already-exists": {
        status: 400,
        message: "Email already exists"
      },
      "auth/invalid-email": {
        status: 400,
        message: "Invalid email format"
      },
      "auth/weak-password": {
        status: 400,
        message: "Password is too weak"
      }
    };

    throw errorMap[err.code] || { status: 500, message: "Internal server error during signup" };
  }
};

// Verify Google ID token
export const verifyGoogleToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    await createUserDocIfNotExists(
      decodedToken.uid,
      decodedToken.email,
      decodedToken.name
    );

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified
    };
  } catch (err) {
    const errorMap = {
      "auth/id-token-expired": {
        status: 401,
        message: "Token has expired"
      },
      "auth/id-token-revoked": {
        status: 401,
        message: "Token has been revoked"
      },
      "auth/invalid-id-token": {
        status: 401,
        message: "Invalid token format"
      }
    };

    throw errorMap[err.code] || { status: 401, message: "Token verification failed" };
  }
};