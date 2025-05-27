import '../assets/Navbar.css';
import petpulse_icon from '../assets/images/Petpulse.png';


const Navbar = () => {
    return (
      <nav>
        <div className = "navbar-container"> </div>
        <img src={petpulse_icon} alt="" className='pplogo'/>
        <ul className="navbar-menu">
          <li>Home</li>
          <li>Calendar</li>
          <li>Task Checklist</li>
          <li>Pet Journal</li>
          <li>Expense Tracker</li>
          <li><button className='btn'>Pet Profile</button></li>
        </ul>
      </nav>
    );
  }
   
  export default Navbar;