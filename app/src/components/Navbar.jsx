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
            onClick={() => navigate("/Home")}
            className={location.pathname === "/home" ? "active" : ""}
            disabled={location.pathname === "/home"}>
            Home
          </button>

          <button
            onClick={() => navigate("/social-Page")}
            className={location.pathname === "/social-Page" ? "active" : ""}
            disabled={location.pathname === "/social-Page"}>
            Social
          </button>

          <button
            onClick={() => navigate("/task-Checklist")}
            className={location.pathname === "/task-Checklist" ? "active" : ""}
            disabled={location.pathname === "/task-Checklist"}>
            Task Checklist
          </button>

          <button
            onClick={() => navigate("/journal")}
            className={location.pathname === "/journal" ? "active" : ""}
            disabled={location.pathname === "/journal"}>
            Pet Journal
          </button>

          <button
            onClick={() => navigate("/expense-Tracker")}
            className={location.pathname === "/expense-Tracker" ? "active" : ""}
            disabled={location.pathname === "/expense-Tracker"}>
            Expense Tracker
          </button>

          <button
            onClick={() => navigate("/nearby-services")}
            className={location.pathname === "/nearby-services" ? "active" : ""}
            disabled={location.pathname === "/nearby-services"}>
            Nearby Services
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