import React, { useState } from 'react'
import '../assets/Login.css';
import { auth } from '../firebase/firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// import user_icon from '../assets/images/person.png';
import email_icon from '../assets/images/email.png';
import password_icon from '../assets/images/password.png';
import petpulse_icon from '../assets/images/Petpulse.png';

const Login = () => {
  const [action, setAction] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => { //asynchronous, so can use await
    try {
      if (action === "Sign Up") {
        await createUserWithEmailAndPassword(auth, email, password); // await pauses the function until Firebase call is done
        console.log("User created successfully"); //shows this message in inspect element
        navigate('/petmgm');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in successfully");
        navigate('/petmgm');
      }
    } catch (error) {
      console.error("Full error:", error); // Keep this for debugging

      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try logging in instead."); //literally appears on user's screen
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

  const handleGoogleSignIn = async () => {
    setError(""); // Clear previous errors
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in successful:", result.user);
      navigate('/petmgm');
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Google sign-in failed. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className='petpulse'> <img src={petpulse_icon} alt='petpulse_logo' className="petpulse-logo" />
      <div className='login-container'>

        <div className='header'>
          <div className='text'> {action} </div>
          <div className='underline'> </div>
        </div>

        <div className='login-inputs'>

          <div className='login-input'>
            <img src={email_icon} alt='' />
            <input type='email'
              placeholder='Email'
              onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className='login-input'>
            <img src={password_icon} alt='' />
            <input type='password'
              placeholder='Password'
              onChange={(e) => setPassword(e.target.value)} />
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

        {/* Add Google Sign-In Button */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <button className="gsi-material-button" onClick={handleGoogleSignIn}>
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                {action === "Sign Up" ? "Sign up with Google" : "Sign in with Google"}
              </span>
            </div>
          </button>
        </div>

        {action === "Login" ? <div className='forgot-password'> Lost Password? <span onClick={handleForgotPassword}>Click Here!</span> </div>
          : <div></div>}  {/* settle routing */}

        <div className='submit-container'>
          <div className={action === "Login" ? "submit gray" : "submit"} onClick={() => { setAction("Sign Up") }}>Sign Up</div>
          <div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={() => { setAction("Login") }}>Login</div>
        </div>

      </div>
    </div>
  )
}

export default Login;