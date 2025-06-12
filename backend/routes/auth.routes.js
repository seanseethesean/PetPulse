import express from 'express';
import admin from '../firebase.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  
  try {
    const userRecord = await admin.auth().createUser({ 
      email, 
      password,
      emailVerified: false 
    });
    
    res.status(201).json({ 
      uid: userRecord.uid, 
      email: userRecord.email,
      message: 'User created successfully' 
    });
  } catch (err) {
    console.error('Signup error:', err);
    
    if (err.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'Email already exists' });
    } else if (err.code === 'auth/invalid-email') {
      return res.status(400).json({ message: 'Invalid email format' });
    } else if (err.code === 'auth/weak-password') {
      return res.status(400).json({ message: 'Password is too weak' });
    }
    
    res.status(500).json({ message: 'Internal server error during signup' });
  }
});

router.post('/login', async (req, res) => {
  res.status(200).json({ 
    message: 'Please use Firebase client SDK for login. This endpoint is for reference only.' 
  });
});

router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  
  if (!idToken) {
    return res.status(400).json({ message: 'ID token is required' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    res.status(200).json({ 
      uid: decodedToken.uid, 
      email: decodedToken.email,
      name: decodedToken.name || userRecord.displayName,
      picture: decodedToken.picture || userRecord.photoURL,
      emailVerified: decodedToken.email_verified
    });
  } catch (err) {
    console.error('Google token verification error:', err);
    
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token has expired' });
    } else if (err.code === 'auth/id-token-revoked') {
      return res.status(401).json({ message: 'Token has been revoked' });
    } else if (err.code === 'auth/invalid-id-token') {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    res.status(401).json({ message: 'Token verification failed' });
  }
});

export default router;