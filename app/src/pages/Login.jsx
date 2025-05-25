import React, { useState } from 'react'
import '../assets/Login.css';
import { auth } from "../firebase.jsx"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import user_icon from '../assets/images/person.png';
import email_icon from '../assets/images/email.png';
import password_icon from '../assets/images/password.png';
import petpulse_icon from '../assets/images/Petpulse.png';

const Login = () => {
  const [action, setAction] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      if (action === "Sign Up") {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created successfully");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in successfully");
      }
    } catch (error) {
      console.error("Full error:", error); // Keep this for debugging

      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try logging in instead.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (error.code === 'auth/user-not-found') {
        setError("No account found with this email. Please sign up first.");
      } else if (error.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection.");
      } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
        setError("Invalid request. Please check your email and password format.");
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className='petpulse'> <img src={petpulse_icon} alt='petpulse_logo' className="logo" />
      <div className='container'>

        <div className='header'>
          <div className='text'> {action} </div>
          <div className='underline'></div>
        </div>

        <div className='inputs'>
          {action !== "Login" && <div className='input'>
            <img src={user_icon} alt='' />
            <input type='text' placeholder='Username' />
          </div>}

          <div className='input'>
            <img src={email_icon} alt='' />
            <input type='email'
              placeholder='Email'
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='input'>
            <img src={password_icon} alt='' />
            <input type='password'
              placeholder='Password'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="submit-button-container">
            <button className="submit-button" onClick={handleSubmit}>Submit</button>
          </div>

        </div>

        {error && (
          <div className="error-message" style={{
            color: 'red',
            textAlign: 'center',
            margin: '10px 0',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {action === "Login" ? <div className='forgot-password'> Lost Password? <span>Click Here!</span> </div>
          : <div></div>}

        <div className='submit-container'>
          <div className={action === "Login" ? "submit gray" : "submit"} onClick={() => { setAction("Sign Up") }}>Sign Up</div>
          <div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={() => { setAction("Login") }}>Login</div>
        </div>

      </div>
    </div>
  )
}

export default Login;