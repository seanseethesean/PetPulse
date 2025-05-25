import '../assets/Navbar.css';
import petpulse_icon from '../assets/images/Petpulse.png';


const Navbar = () => {
    return (
      <nav className = "navbar"> 
        <img src={petpulse_icon} alt="" className='logo'/>
        <ul className="navbar-menu">
          <li>Home</li>
          <li>Calendar</li>
          <li>Task Checklist</li>
          <li>Pet Journal</li>
          <li>Expense Tracker</li>
          <li><button className='petBtn'>Pet Profile</button></li>
        </ul>
      </nav>
    );
  }
   
  export default Navbar;