import { useEffect, useState } from "react"
import "../assets/PetMgm.css"
import { useNavigate } from "react-router-dom"
import { getAuth } from "firebase/auth"

// import pet_icon from "../assets/images/petname.png"
// import animaltype_icon from "../assets/images/animaltype.png"

const addPetIcon = {
  pet_icon: "🙈",
  animaltype_icon: "🙉",
  breed_icon: "🙊"
};

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
  const [editingPet, setEditing] = useState(null)
  const URL = process.env.REACT_APP_API_URL
  const auth = getAuth()

  useEffect(() => {
    const fetchPets = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return // login authentication

      const res = await fetch(
        `${URL}/api/pets?userId=${user.uid}`
      )
      const data = await res.json()
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

    try {
      const response = await fetch(
        `${URL}/api/pets`,
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
          `${URL}/api/pets?userId=${user.uid}`
        )
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

  const handleEditPet = async (petId) => {
    const pet = petList.find((p) => p.id === petId)
    const user = auth.currentUser
    const res = await fetch(`${URL}/api/pets/${petId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pet, userId: user.uid })
    })
    const result = await res.json()
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
    const res = await fetch(`${URL}/api/pets/${petId}`, { method: "DELETE" })
    const result = await res.json()
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
                      name="name"
                      value={pet.name}
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
                    <h3>{pet.name}</h3>
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
                        onClick={() => handleSelectPet(pet.name)}>
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="pet name"
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
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
