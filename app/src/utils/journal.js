const getURL = () => process.env.REACT_APP_API_URL;

class JournalService {
  formatDateForAPI(date) {
    return date.toISOString().split("T")[0];
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getEntries(userId, petName) {
    try {
      const response = await fetch(`${getURL()}/api/journal?userId=${userId}&petName=${petName}`);
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      throw error;
    }
  }

  async createEntry(entryData) {
    try {
      const response = await fetch(`${getURL()}/api/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      throw error;
    }
  }

  async updateEntry(entryId, entryData) {
    try {
      const response = await fetch(`${getURL()}/api/journal/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      throw error;
    }
  }

  async deleteEntry(entryId) {
    try {
      const response = await fetch(`${getURL()}/api/journal/${entryId}`, {
        method: "DELETE"
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      throw error;
    }
  }
}

export default new JournalService();