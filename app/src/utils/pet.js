const URL = process.env.REACT_APP_API_URL;

class PetService {
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getPets(userId) {
    const response = await fetch(`${URL}/api/pets?userId=${userId}`);
    return await this.handleResponse(response);
  }

  async createPet(petData) {
    const response = await fetch(`${URL}/api/pets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(petData)
    });
    return await this.handleResponse(response);
  }

  async updatePet(petId, petData) {
    const response = await fetch(`${URL}/api/pets/${petId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(petData)
    });
    return await this.handleResponse(response);
  }

  async deletePet(petId) {
    const response = await fetch(`${URL}/api/pets/${petId}`, {
      method: "DELETE"
    });
    return await this.handleResponse(response);
  }
}

export default new PetService();
