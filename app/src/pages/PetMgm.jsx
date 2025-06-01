import { useEffect, useState } from "react"
import "../assets/PetMgm.css"
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/firebase.js';
import { collection, addDoc, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

import pet_icon from "../assets/images/petname.png"
import animaltype_icon from "../assets/images/animaltype.png"

const PetMgm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    petName: "",
    animalType: "",
    breed: "",
    dob: ""
  })

  const [imageFile, setImageFile] = useState(null)
  const [petList, setPetList] = useState([])
  const [selectedPet, setSelectedPet] = useState("")
  const [errors, setErrors] = useState({});

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
    // if (!formData.petName || !formData.animalType) {
    //   alert("Please fill in all required fields before submitting.");
    //   return;
    // }

    const newErrors = {};

    if (!formData.petName) newErrors.petName = "required";
    if (!formData.animalType) newErrors.animalType = "required";
    if (!formData.breed) newErrors.breed = "required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({}); 

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

      // reset to allow adding of new pet
      setFormData({
        petName: "",
        animalType: "",
        breed: "",
        dob: ""
      })
      setImageFile(null)

      // reloads the pet list
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
      <div className="select-pet">
        <label htmlFor="petDropdown">Select Pet: </label>
        <select
          id="petDropdown"
          value={selectedPet}
          onChange={(e) => {
            const selected = e.target.value;
            setSelectedPet(selected);
            if (selected) {
              navigate("/home"); 
            }
          }}
      >
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
            {errors.petName && <p className="error-text">{errors.petName}</p>}
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
            {errors.animalType && <p className="error-text">{errors.animalType}</p>}
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
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />

          </div>
        </div>
      </div>
    </div>
  )
}

export default PetMgm