import { useEffect, useState } from "react"
import "../assets/PetMgm.css"
// import Navbar from "../components/Navbar"

import { getAuth } from "firebase/auth";
import { query, where } from "firebase/firestore";
import { db, storage } from "./app/src/firebase/firebase.js"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

import pet_icon from "../assets/images/petname.png"
// import dob_icon from "../assets/images/dob.png"
import animaltype_icon from "../assets/images/animaltype.png"
// import upload_icon from "../assets/images/upload.png"

const PetMgm = () => {
  // const [action, setAction] = useState("New Pet")
  // const [selectedPet, setSelectedPet] = useState("");
  // const petList = ["Bella", "Whisky", "Tiger", "Tofu"];
  const [formData, setFormData] = useState({
    petName: "",
    animalType: "",
    breed: "",
    dob: "",
    imageURL: ""
  })

  const [imageFile, setImageFile] = useState(null)
  const [petList, setPetList] = useState([])
  const [selectedPet, setSelectedPet] = useState("")

  useEffect(() => {
    const fetchPets = async () => {
      const querySnapshot = await getDocs(collection(db, "pets"))
      const pets = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      setPetList(pets)
    }
    fetchPets()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      let imageURL = ""
      if (imageFile) {
        const imageRef = ref(storage, `pets/${Date.now()}_${imageFile.name}`)
        await uploadBytes(imageRef, imageFile)
        imageURL = await getDownloadURL(imageRef)
      }

      const petData = { ...formData, imageURL }
      await addDoc(collection(db, "pets"), petData)
      alert("Pet added!")

      // Reset
      setFormData({
        petName: "",
        animalType: "",
        breed: "",
        dob: "",
        imageURL: ""
      })
      setImageFile(null)

      // Reload pet list
      const querySnapshot = await getDocs(collection(db, "pets"))
      const pets = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      setPetList(pets)
    } catch (err) {
      console.error("Error adding pet:", err)
    }
  }

  return (
    <div className="profile">
      {/* <div> <Navbar></Navbar></div> */}
      <div className="select-pet">
        <label htmlFor="petDropdown">Select Pet: </label>
        <select
          id="petDropdown"
          value={selectedPet}
          onChange={(e) => setSelectedPet(e.target.value)}>
          {petList.length === 0 ? (
            <option disabled>No pets yet</option>
          ) : (
            petList.map((pet) => (
              <option key={pet.id} value={pet.petName}>
                {pet.petName}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="newpet">
        <button className="add-pet-button" onClick={handleSubmit}>Add New Pet</button>

        <div className="petmgm-inputs">
          <div className="petmgm-input">
            <img src={pet_icon} alt="" />
            <input
              type="text"
              name="petName"
              value={formData.petName}
              onChange={handleChange}
              placeholder="pet name"
            />
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
          </div>

          <div className="petmgm-input">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />

          </div>

          <div className="blank">
            <p>Upload an image of your pet!</p>
            {/* <label htmlFor="petImage"></label>
            <input type="file" id="petImage" accept="image/*" /> */}
            <input
              type="file"
              id="petImage"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PetMgm
