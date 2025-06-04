import { useEffect, useState } from "react"
import "../assets/PetMgm.css"
import { useNavigate } from 'react-router-dom';

import pet_icon from "../assets/images/petname.png"
import animaltype_icon from "../assets/images/animaltype.png"

const PetMgm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    animalType: "",
    breed: "",
    birthday: ""
  })

  const [petList, setPetList] = useState([])
  const [selectedPet, setSelectedPet] = useState("")
  const [errors, setErrors] = useState({});
  const URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch(`${URL}/api/pets`);
        const data = await response.json();
        if (data.success) {
          setPetList(data.pets);
        } else {
          console.error("Failed to fetch pets:", data.error);
        }
      } catch (err) {
        console.error("Error fetching pets:", err);
      }
    };
    fetchPets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "required";
    if (!formData.animalType) newErrors.animalType = "required";
    if (!formData.breed) newErrors.breed = "required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    try {
      const response = await fetch(`${URL}/api/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        alert("Pet added!");
        setFormData({
          name: "",
          animalType: "",
          breed: "",
          birthday: ""
        });

        // re-fetch pets
        const res = await fetch(`${URL}/api/pets`);
        const data = await res.json();
        if (data.success) {
          setPetList(data.pets);
        }
      } else {
        console.error("Failed to add pet:", result.error);
      }
    } catch (err) {
      console.error("Error submitting pet:", err);
    }
  };

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
              localStorage.setItem("selectedPetName", selected);
              navigate("/home");
            }
          }}
        >
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
        <button className="add-pet-button" onClick={handleSubmit}>Add New Pet</button>

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