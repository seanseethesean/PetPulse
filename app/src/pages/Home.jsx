import "../assets/Home.css"
import Navbar from "../components/Navbar"
// import { useNavigate } from "react-router-dom"
// import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

const Home = () => {
  // const navigate = useNavigate();
  // const goToPetMgm = () => {
  //   navigate('/PetMgm');  // navigate to /petmgm route
  // };

  // const location = useLocation()
  const [selectedPetName, setSelectedPetName] = useState("")

  useEffect(() => {
    const name = localStorage.getItem("selectedPetName")
    console.log("Retrieved from localStorage on mount:", name);
    setSelectedPetName(name || "")
    console.log("Selected from storage:", name)
  }, [])

  return (
    <div className="home container">
      <div className="home-text">
        <div><Navbar></Navbar></div>
        {selectedPetName && (
          <h1>Welcome back, {selectedPetName}!</h1>
        )}
        <h2>Revolutionizing pet care for you</h2>
        <p>
          Here, we are determined to help you stay organized, connected, and
          confident in giving your pets the love and attention they deserve
        </p>
        {/* <button onClick={goToPetMgm} className='startBtn'>Get Started!</button> */}
        {/* <button onClick={goToPetMgm}> This button goes to pet management </button> */}
      </div>
    </div>
  )
}

export default Home
