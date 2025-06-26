import { useEffect, useState } from "react"
import "../assets/PetMgm.css"
import { useNavigate } from "react-router-dom"
import { getAuth } from "firebase/auth"
import PetService from "../utils/pet";

const addPetIcon = {
  pet_icon: "🙈",
  animaltype_icon: "🙉",
  breed_icon: "🙊"
};

const PetMgm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    petName: "",
    animalType: "",
    breed: "",
    birthday: ""
  })

  const [petList, setPetList] = useState([])
  const [selectedPet, setSelectedPet] = useState("")
  const [errors, setErrors] = useState({})
  const [editingPet, setEditing] = useState(null)
  const URL = process.env.REACT_APP_API_URL
  const auth = getAuth()

  useEffect(() => {
    const fetchPets = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return // login authentication

      const data = await PetService.getPets(user.uid)
      if (data.success) {
        setPetList(data.pets)
      }
    }
    fetchPets() // make it user return
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditChange = (e, petId) => {
    const { name, value } = e.target
    setPetList((prev) =>
      prev.map((pet) => (pet.id === petId ? { ...pet, [name]: value } : pet))
    )
  }

  const handleSubmit = async () => {
    const newErrors = {}

    if (!formData.petName) newErrors.petName = "required"
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

    try {
      const result = await PetService.createPet(petData)
      if (result.success) {
        alert("Pet added!")
        setFormData({
          petName: "",
          animalType: "",
          breed: "",
          birthday: ""
        })

        // re-fetch pets
        const data = await PetService.getPets(user.uid)
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

  const handleEditPet = async (petId) => {
    const pet = petList.find((p) => p.id === petId)
    const user = auth.currentUser
   
    const result = await PetService.updatePet(petId, { ...pet, userId: user.uid })
    if (result.success) {
      alert("Pet updated!")
      setEditing(null)
    } else {
      console.error("Update failed:", result.error)
    }
  }

  // DELETE PET VIA FETCH
  const handleDeletePet = async (petId) => {
    if (!window.confirm("Are you sure?")) return
    const result = await PetService.deletePet(petId)
    if (result.success) {
      alert("Pet deleted!")
      setPetList((pl) => pl.filter((p) => p.id !== petId))
    } else {
      console.error("Delete failed:", result.error)
    }
  }

  const handleSelectPet = (petName) => {
    localStorage.setItem("selectedPetName", petName)
    navigate("/home")
  }

  return (
    <div className="pet-management-container">
      {/* Left Panel - Existing Pets */}
      <div className="pets-list-panel">
        <h2>Your Pets</h2>

        {petList.length === 0 ? (
          <div className="no-pets">
            <p>No pets added yet. Add your first pet on the right!</p>
          </div>
        ) : (
          <div className="pets-grid">
            {petList.map((pet) => (
              <div key={pet.id} className="pet-card">
                {editingPet === pet.id ? (
                  // Edit mode
                  <div className="pet-edit-form">
                    <input
                      type="text"
                      name="petName"
                      value={pet.petName}
                      onChange={(e) => handleEditChange(e, pet.id)}
                      className="edit-input"
                    />
                    <input
                      type="text"
                      name="animalType"
                      value={pet.animalType}
                      onChange={(e) => handleEditChange(e, pet.id)}
                      className="edit-input"
                    />
                    <input
                      type="text"
                      name="breed"
                      value={pet.breed}
                      onChange={(e) => handleEditChange(e, pet.id)}
                      className="edit-input"
                    />
                    <input
                      type="date"
                      name="birthday"
                      value={pet.birthday}
                      onChange={(e) => handleEditChange(e, pet.id)}
                      className="edit-input"
                    />
                    <div className="edit-buttons">
                      <button
                        className="save-btn"
                        onClick={() => handleEditPet(pet.id)}>
                        Save
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="pet-info">
                    <h3>{pet.petName}</h3>
                    <p>
                      <strong>Type:</strong> {pet.animalType}
                    </p>
                    <p>
                      <strong>Breed:</strong> {pet.breed}
                    </p>
                    <p>
                      <strong>Birthday:</strong> {pet.birthday}
                    </p>

                    <div className="pet-actions">
                      <button
                        className="select-btn"
                        onClick={() => handleSelectPet(pet.petName)}>
                        Select Pet
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => setEditing(pet.id)}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeletePet(pet.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - Add New Pet */}
      <div className="add-pet-panel">
        <h2>🐾 Join the Family! 🐾</h2>

        <div className="petmgm-inputs">
          <div className="petmgm-input">
            <span className="emoji-icon">{addPetIcon.pet_icon}</span>
            <input
              type="text"
              name="petName"
              value={formData.petName}
              onChange={handleChange}
              placeholder="name"
            />
            {errors.petName && <p className="error-text">{errors.petName}</p>}
          </div>

          <div className="petmgm-input">
            <span className="emoji-icon">{addPetIcon.animaltype_icon}</span>
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
            <span className="emoji-icon">{addPetIcon.breed_icon}</span>
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

        <button className="add-pet-button" onClick={handleSubmit}>
          Add New Pet
        </button>
      </div>
    </div>
  )
}

export default PetMgm