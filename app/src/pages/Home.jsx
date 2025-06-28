import "../assets/Home.css"
import Navbar from "../components/Navbar"
import { useEffect, useState } from "react"

const Home = () => {
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
          <h1>{selectedPetName}'s day is about to get a whole lot better!</h1>
        )}
      </div>
    </div>
  )
}

export default Home