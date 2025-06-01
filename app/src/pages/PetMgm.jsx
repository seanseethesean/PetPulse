import { useEffect, useState } from "react"
import "../assets/PetMgm.css"
import { useNavigate } from "react-router-dom"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase";
// import Navbar from "../components/Navbar"

import pet_icon from "../assets/images/petname.png"
// import dob_icon from "../assets/images/dob.png"
import animaltype_icon from "../assets/images/animaltype.png"
// import upload_icon from "../assets/images/upload.png"

const PetMgm = () => {
  // const [action, setAction] = useState("New Pet")
  // const [selectedPet, setSelectedPet] = useState("");
  // const petList = ["Bella", "Whisky", "Tiger", "Tofu"];
  const navigate = useNavigate()
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
  const [errors, setErrors] = useState({});
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await fetch(`${API}/api/pets`);
        const data = await res.json();
        if (data.success) setPetList(data.pets);
      } catch (err) {
        console.error("Failed to fetch pets:", err);
      }
    };
    fetchPets();
  }, [API]);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    // if (!formData.petName || !formData.animalType) {
    //   alert("Please fill in all required fields before submitting.");
    //   return;
    // }

    const newErrors = {}

    if (!formData.petName) newErrors.petName = "required"
    if (!formData.animalType) newErrors.animalType = "required"
    if (!formData.breed) newErrors.breed = "required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
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
      await fetch(`${API}/api/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(petData)
      });

      alert("Pet added!")

      // reset to allow adding of new pet
      setFormData({
        petName: "",
        animalType: "",
        breed: "",
        dob: "",
        imageURL: ""
      })
      setImageFile(null)

      // reloads the pet list from your backend API
      const res = await fetch(`${API}/api/pets`)
      const data = await res.json()
      if (data.success) setPetList(data.pets)

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
            const selected = e.target.value
            setSelectedPet(selected)
            if (selected) {
              console.log("Saving to localStorage:", selected)
              localStorage.setItem("selectedPetName", selected)
              navigate("/home")
            }
          }}>

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
        <button className="add-pet-button" onClick={handleSubmit}>
          Add New Pet
        </button>

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
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>

          {/* need to pay to use firebase storage */}
          {/* <div className="blank">
            <p>Upload an image of your pet!</p>
            <input
              type="file"
              id="petImage"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default PetMgm
