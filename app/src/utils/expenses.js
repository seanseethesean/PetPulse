const URL = process.env.REACT_APP_API_URL;

class ExpenseService {
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

  // Get all expenses for a user
  async getExpenses(userId, petId = null) {
    try {
      let url = `${URL}/api/expenses?userId=${userId}`;
      if (petId && petId !== 'all') {
        url += `&petId=${petId}`;
      }
      const response = await fetch(url);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  // Get expenses by date range
  async getExpensesByDateRange(userId, startDate, endDate, petId = null) {
    try {
      let url = `${URL}/api/expenses/date-range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`;
      if (petId && petId !== 'all') {
        url += `&petId=${petId}`;
      }
      const response = await fetch(url);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching expenses by date range:', error);
      throw error;
    }
  }

  // Create a new expense
  async createExpense(expenseData) {
    try {
      const response = await fetch(`${URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  // Update an expense
  async updateExpense(expenseId, updateData) {
    try {
      const response = await fetch(`${URL}/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  // Delete an expense
  async deleteExpense(expenseId) {
    try {
      const response = await fetch(`${URL}/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
}

export default new ExpenseService();