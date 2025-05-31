import "../assets/Navbar.css"
import petpulse_icon from "../assets/images/Petpulse.png"
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav>
      <div className="navbar-container">
        <img src={petpulse_icon} alt="logo" className="pplogo" />
        <ul className="navbar-menu">
          <li>Home</li>
          <li>Calendar</li>
          <li>Task Checklist</li>
          <li>Pet Journal</li>
          <li>Expense Tracker</li>
        </ul>
        <button className="btn" onClick={() => navigate("/petmgm")}>Pet Profile</button>
      </div>
    </nav>
  );
}

export default Navbar;
