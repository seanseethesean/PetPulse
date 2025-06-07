import { useEffect, useState } from "react"
import "../assets/PetMgm.css"
import { useNavigate } from "react-router-dom"
import { getAuth } from "firebase/auth"
// import { db, storage } from '../firebase/firebase.js';
// import { collection, addDoc, getDocs } from "firebase/firestore"
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

import pet_icon from "../assets/images/petname.png"
import animaltype_icon from "../assets/images/animaltype.png"

const PetMgm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    animalType: "",
    breed: "",
    birthday: ""
  })

  const [petList, setPetList] = useState([])
  const [selectedPet, setSelectedPet] = useState("")
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchPets = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/Pets?userId=${user.uid}`
      )
      const data = await res.json()
      if (data.success) {
        setPetList(data.pets)
      }
    }
    fetchPets()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    //debug
    console.log("🔔 Add New Pet button clicked")
    //debug

    const newErrors = {}

    if (!formData.name) newErrors.name = "required"
    if (!formData.animalType) newErrors.animalType = "required"
    if (!formData.breed) newErrors.breed = "required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const auth = getAuth()
    const user = auth.currentUser

    const petData = {
      ...formData,
      userId: user.uid
    }

    //start of debug
    console.log("🟢 [PetMgm] About to POST petData:", petData)
    const postUrl = `${process.env.REACT_APP_API_URL}/api/Pets`
    console.log("🟢 [PetMgm] POST URL =", postUrl)
    //end of debug

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/Pets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(petData)
        }
      )

      const result = await response.json()
      if (result.success) {
        alert("Pet added!")
        setFormData({
          name: "",
          animalType: "",
          breed: "",
          birthday: ""
        })

        // re-fetch pets
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/Pets?userId=${user.uid}`
        ) // ensures that pets unqiue to user is fetched
        const data = await res.json()
        if (data.success) {
          setPetList(data.pets)
        }
      } else {
        console.error("Failed to add pet:", result.error)
      }
    } catch (err) {
      console.error("Error submitting pet:", err)
    }
  }

  return (
    <div className="profile">
      <div className="select-pet">
        <label htmlFor="petDropdown">Select Pet: </label>
        <select
          id="petDropdown"
          value={selectedPet}
          onChange={(e) => {
            const selected = e.target.value
            setSelectedPet(selected)
            if (selected) {
              localStorage.setItem("selectedPetName", selected) // Save it
              navigate("/home")
            }
          }}>
          {petList.length === 0 ? (
            <option disabled>No pets yet</option>
          ) : (
            petList.map((pet) => (
              <option key={pet.id} value={pet.name}>
                {pet.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="newpet">
        {/* <button className="add-pet-button" onClick={handleSubmit}>
          Add New Pet
        </button> */}
        {/* debug */}
        <button onClick={() => console.log("Inline click works!")}>
          Test Click
        </button>

        <div className="petmgm-inputs">
          <div className="petmgm-input">
            <img src={pet_icon} alt="" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="pet name"
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="petmgm-input">
            <img src={animaltype_icon} alt="" />
            <input
              type="text"
              name="animalType"
              value={formData.animalType}
              onChange={handleChange}
              placeholder="animal type"
            />
            {errors.animalType && (
              <p className="error-text">{errors.animalType}</p>
            )}
          </div>

          <div className="petmgm-input">
            <img src={pet_icon} alt="" />
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="breed"
            />
            {errors.breed && <p className="error-text">{errors.breed}</p>}
          </div>

          <div className="petmgm-input">
            <label htmlFor="birthday">Date of Birth</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PetMgm
