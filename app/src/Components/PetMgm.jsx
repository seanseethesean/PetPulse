import { useState } from 'react'
import "../assets/PetMgm.css"

import pet_icon from '../assets/images/petname.png';
import dob_icon from '../assets/images/dob.png';
import animaltype_icon from '../assets/images/animaltype.png';
import upload_icon from '../assets/images/upload.png';

const PetMgm = () => {
  // const [action, setAction] = useState("New Pet")
  const [selectedPet, setSelectedPet] = useState("");
  const petList = ["Bella", "Whisky", "Tiger", "Tofu"];
  
  return (
      <div className='profile'> 
        <div className='select-pet'>
          <label htmlFor="petDropdown">Select Pet: </label>
          <select
            id="petDropdown"
            value={selectedPet}
            onChange={(e) => setSelectedPet(e.target.value)}
          >
            <option value="">-- choose a pet --</option>
            {petList.map((pet, idx) => (
              <option key={idx} value={pet}>{pet}</option>
            ))}
          </select>
        </div>

        <div className='newpet'>
          <button className="add-pet-button">Add New Pet</button>

          <div className="petmgm-inputs">
            <div className="petmgm-input">
              <img src={pet_icon} alt="" />
              <input type="text" placeholder="pet name" />
            </div>

            <div className="petmgm-input">
              <img src={animaltype_icon} alt="" />
              <input type="text" placeholder="animal type" />
            </div>

            <div className="petmgm-input">
              <img src={pet_icon} alt="" />
              <input type="text" placeholder="breed" />
            </div>

            <div className="petmgm-input">
              <label htmlFor="dob">Date of Birth</label>
              <input type="date" placeholder="" />
            </div>

            <div className="blank">
            Upload an image
              <label htmlFor="petImage"></label>
              <input type="file" id="petImage" accept="image/*" />

            </div>

          </div>
      </div>
    </div>
  );
};

export default PetMgm;