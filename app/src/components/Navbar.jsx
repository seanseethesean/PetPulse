import "../assets/Navbar.css"
import petpulse_icon from "../assets/images/Petpulse.png"
import { useNavigate } from "react-router-dom"


const Navbar = () => {
 const navigate = useNavigate()


 return (
   <nav>
     <div className="navbar-container">
       <img src={petpulse_icon} alt="logo" className="pplogo" />
       <ul className="navbar-menu">
         <button onClick={() => navigate("/Home")}>
           Home
         </button>
         <button onClick={() => navigate("/Calendar")}>Calendar</button>
         <button onClick={() => navigate("/Task-Checklist")}>
           Task Checklist
         </button>
         <button onClick={() => navigate("/Journal")}>
           Pet Journal
         </button>
         <button onClick={() => navigate("/Expense-Tracker")}>
           Expense Tracker
         </button>
       </ul>
       <button className="btn" onClick={() => navigate("/petmgm")}>
         Pet Profile
       </button>
     </div>
   </nav>
 )
}

export default Navbar