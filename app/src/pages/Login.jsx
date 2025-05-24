import React, { useState } from 'react'
import './Login.css';

import user_icon from '../Components/Assets/person.png';
import email_icon from '../Components/Assets/email.png';
import password_icon from '../Components/Assets/password.png';
import petpulse_icon from '../Components/Assets/Petpulse.png';

const Login = () => {
  const [action, setAction] = useState("Sign Up");

  return (
    <div className = 'petpulse'> <img src={petpulse_icon} alt='petpulse_logo' className = "logo"/> 
      <div className= 'container'>
        
        <div className = 'header'>
          <div className= 'text'> {action} </div>
          <div className = 'underline'></div>
        </div>

        <div className ='inputs'>
          {action === "Login" ? <div></div> : <div className ='input'>
            <img src={user_icon} alt=''/>
            <input type='text' placeholder='Username'/>
          </div>}

          <div className ='input'>
            <img src={email_icon} alt=''/>
            <input type='email' placeholder='Email'/>
          </div>

          <div className ='input'>
            <img src={password_icon} alt=''/>
            <input type='password' placeholder='Password'/>
          </div>
        </div>

        {action === "Login" ? <div className='forgot-password'> Lost Password? <span>Click Here!</span> </div> 
        : <div></div>}
        
        <div className ='submit-container'> 
          <div className={action === "Login" ? "submit gray" : "submit"} onClick={() => {setAction("Sign Up")}}>Sign Up</div>
          <div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={() => {setAction("Login")}}>Log in</div>
        </div>

      </div>
    </div>
  )
}

export default Login;
