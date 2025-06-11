import "../assets/Navbar.css"
import petpulse_icon from "../assets/images/Petpulse.png"
import { useNavigate, useLocation } from "react-router-dom"

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav>
      <div className="navbar-container">
        <img src={petpulse_icon} alt="logo" className="pplogo" />

        <ul className="navbar-menu">
          <button
            onClick={() => navigate("/Calendar")}
            className={location.pathname === "/Calendar" ? "active" : ""}
            disabled={location.pathname === "/Calendar"}>
            Calendar
          </button>

          <button
            onClick={() => navigate("/Task-Checklist")}
            className={location.pathname === "/Task-Checklist" ? "active" : ""}
            disabled={location.pathname === "/Task-Checklist"}>
            Task Checklist
          </button>

          <button
            onClick={() => navigate("/Home")}
            className={location.pathname === "/Home" ? "active" : ""}
            disabled={location.pathname === "/Home"}>
            Home
          </button>

          <button
            onClick={() => navigate("/Journal")}
            className={location.pathname === "/Journal" ? "active" : ""}
            disabled={location.pathname === "/Journal"}>
            Pet Journal
          </button>

          <button
            onClick={() => navigate("/Expense-Tracker")}
            className={location.pathname === "/Expense-Tracker" ? "active" : ""}
            disabled={location.pÍthname === "/Expense-Tracker"}>
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
