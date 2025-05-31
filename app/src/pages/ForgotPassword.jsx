import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from 'firebase.js';
import { useNavigate } from 'react-router-dom';
import '../assets/ForgotPassword.css';

import email_icon from '../assets/images/email.png';
import petpulse_icon from '../assets/images/Petpulse.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault(); // needed so browser won't perform full page refresh and lose all react states

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox and follow the instructions to reset your password.');
    } catch (error) {
      console.error('Password reset error:', error);

      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className='petpulse'>
      <img src={petpulse_icon} alt='petpulse_logo' className="petpulse-logo" />

      <div className='forgot-password-container'>
        <div className='header'>
          <div className='text'>Reset Password</div>
          <div className='underline'></div>
        </div>

        <div className='forgot-password-description'>
          Enter your email address and we'll send you a link to reset your password.
        </div>

        <form onSubmit={handleResetPassword} className='forgot-password-form'>
          <div className='login-input'>
            <img src={email_icon} alt='' />
            <input
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}/>
          </div>

          {error && (
            <div className="error-message"> {error} </div>
          )}

          {message && (
            <div className="success-message"> {message} </div>
          )}

          <div className="button-container">
            <button type="submit"
              className="reset-button"
              disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </div>
        </form>

        <div className="back-to-login">
          <span onClick={handleBackToLogin}>Back to Login</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;