const URL = process.env.REACT_APP_API_URL;

class TaskService {
  // Helper method to format date for API
  formatDateForAPI(date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Get tasks for a specific date and user
  async getTasksByDate(date, userId) {
    try {
      const dateStr = this.formatDateForAPI(date);
      const response = await fetch(`${URL}/api/tasks?date=${dateStr}&userId=${userId}`);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Create a new task
  async createTask(taskData) {
      const response = await fetch(`${URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      return this.handleResponse(response);
  }

  // Update a task
  async updateTask(taskId, updateData) {
    try {
      const response = await fetch(`${URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Toggle task completion
  async toggleTaskCompletion(taskId, completed) {
    try {
      const response = await fetch(`${URL}/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId) {
    try {
      const response = await fetch(`${URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new TaskService();