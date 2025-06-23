import React, { useState, useMemo, useEffect } from "react"
import { DollarSign, Filter, Trash2, PawPrint } from 'lucide-react';
import Navbar from "../components/Navbar";
import '../assets/ExpenseTracker.css';
import { getAuth } from "firebase/auth";
import ExpenseService from "../utils/expenses";

const categoryEmojis = {
  Food: '🍽️',
  Grooming: '✂️',
  Vet: '🏥',
  Medicine: '💊',
  Training: '🏋️',
  Toys: '🧸',
  Accessories: '🎒',
  Others: '🛍️'
};

const ExpenseTracker = () => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [selectedPet, setSelectedPet] = useState('all');
  const [editingExpense, setEditingExpense] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Food',
    petId: '',
    date: new Date().toISOString().split("T")[0]
  });

  // Fetch pets first when component mounts
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        console.log("Fetching pets for user:", user.uid);
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/pets?userId=${user.uid}`);
        const data = await res.json();
        console.log("Fetched pets:", data);

        if (data.success) {
          setPets(data.pets);
          // Set default pet for new expense form
          if (data.pets.length > 0 && !newExpense.petId) {
            setNewExpense(prev => ({ ...prev, petId: data.pets[0].id.toString() }));
          }
        } else {
          setError(data.error || 'Failed to load pets');
        }
      } catch (err) {
        console.error('Failed to fetch pets:', err);
        setError('Failed to load pets');
      }
    };

    // Check if user is already authenticated
    if (auth.currentUser) {
      fetchPets();
    }

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Auth state changed, user logged in:", user.uid);
        fetchPets();
      } else {
        console.log("User logged out");
        setPets([]);
        setExpenses([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch expenses when pets are loaded or selectedPet changes
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError(null);
        const user = auth.currentUser;
        if (!user) {
          console.log("No user found, waiting for auth...");
          return;
        }

        console.log("Fetching expenses for user:", user.uid, "pet filter:", selectedPet);

        // Use 'all' instead of the pet name for the API call
        const petFilter = selectedPet === 'all' ? 'all' : selectedPet;
        const expenseData = await ExpenseService.getExpenses(user.uid, petFilter);

        console.log("Fetched expenses:", expenseData);
        setExpenses(expenseData || []);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        setError("Failed to load expenses: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch expenses if we have a user and pets have been loaded
    if (auth.currentUser && (pets.length > 0 || selectedPet === 'all')) {
      fetchExpenses();
    }
  }, [selectedPet, pets]);

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const selectedPetData = pets.find(p => p.id.toString() === newExpense.petId);

      if (!selectedPetData) {
        alert('Please select a valid pet');
        return;
      }

      const payload = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        userId: user.uid,
        petId: selectedPetData.id.toString(),
        petName: selectedPetData.name,
        date: newExpense.date 
      };

      const created = await ExpenseService.createExpense(payload);
      setExpenses([created, ...expenses]);

      setNewExpense({
        description: '',
        amount: '',
        category: 'Food',
        petId: newExpense.petId,
        date: newExpense.date 
      });
      setShowAddExpense(false);
    } catch (err) {
      console.error("Error adding expense:", err);
      alert("Failed to add expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await ExpenseService.deleteExpense(expenseId);
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense");
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense({
      ...expense,
      date: new Date(expense.date).toISOString().split("T")[0],
      petId: expense.petId || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingExpense.description || !editingExpense.amount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const selectedPetData = pets.find(p => p.id.toString() === editingExpense.petId);

      if (!selectedPetData) {
        alert('Please select a valid pet');
        return;
      }

      const updated = {
        ...editingExpense,
        amount: parseFloat(editingExpense.amount),
        petName: selectedPetData.name, // Update pet name in case it changed
      };

      await ExpenseService.updateExpense(editingExpense.id, updated);

      setExpenses(expenses.map(exp =>
        exp.id === editingExpense.id ? { ...exp, ...updated } : exp
      ));

      setShowEditModal(false);
      setEditingExpense(null);
    } catch (err) {
      console.error("Error updating expense:", err);
      alert("Failed to update expense");
    }
  };

  const { totalExpenses, categoryTotals, filteredExpenses } = useMemo(() => {
    // Filter expenses by selected pet
    const filtered = selectedPet === 'all'
      ? expenses
      : expenses.filter(exp => exp.petName === selectedPet);

    // Calculate total
    const total = filtered.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    // Calculate category totals
    const categories = filtered.reduce((acc, exp) => {
      const category = exp.category || 'others';
      acc[category] = (acc[category] || 0) + (parseFloat(exp.amount) || 0);
      return acc;
    }, {});

    return {
      totalExpenses: total,
      categoryTotals: categories,
      filteredExpenses: filtered
    };
  }, [expenses, selectedPet]);

  const recentExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [filteredExpenses]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount || 0);
  };

  return (
    <div className="expense-tracker">
      <Navbar />
      <div className="expense-tracker-container">

        {/* Header */}
        <div className="expense-tracker-header">
          <div className="expense-header-title">
            <PawPrint className="paw-print-icon" />
            <h1>Expense Tracker</h1>
          </div>
          <p className="expense-subtitle">Keep track of all your pet-related expenses</p>
        </div>

        {/* Summary card */}
        <div className="expense-summary">
          <DollarSign className="dollar-icon" />
          <div className="expense-summary-content">
            <h3>Total Expenses</h3>
            <p className="expense-amount">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        {/* Pet filter */}
        <div className="expense-filter-wrapper">
          <div className="expense-filter">
            <div className="filter-container">
              <Filter className="filter-icon" />
              {/* need to change to pets from database */}
              <select className="pet-filter-select"
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
              >
                <option value="all">All Pets</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.name}>{pet.name}</option>
                ))}
              </select>
            </div>
            <button className="add-expense" onClick={() => setShowAddExpense(true)}>Add Expense</button>
          </div>
        </div>

        {/* Expense list */}
        <div className="expense-list">
          <h1 className="expense-list-header">Expenses by Category</h1>
          <div className="expense-category">
            <div className="expense-category-scroll-box">
              <ul>
                {Object.entries({
                  Food: categoryTotals.Food || 0,
                  Grooming: categoryTotals.Grooming || 0,
                  Vet: categoryTotals.Vet || 0,
                  Medicine: categoryTotals.Medicine || 0,
                  Training: categoryTotals.Training || 0,
                  Toys: categoryTotals.Toys || 0,
                  Accessories: categoryTotals.Accessories || 0,
                  Others: categoryTotals.Others || 0
                }).map(([category, amount]) => (
                  <li key={category}>
                    <span className="expense-category-name">{categoryEmojis[category]} {category}</span>
                    <span className="expense-category-amount">{formatCurrency(amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent expenses */}
        <div className="recent-expenses">
          <div className="recent-expenses-header">
            <h1 className="recent-expense-header"> Recent expenses </h1>
          </div>
          <div className="recent-expenses-table-container">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Pet</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.length > 0 ? recentExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td>{exp.petName}</td>
                    <td className="expense-category-cell">{exp.category}</td>
                    <td>{exp.description}</td>
                    <td className="amount-cell">{formatCurrency(exp.amount)}</td>
                    <td>
                      <div className="expense-actions">
                        <button className="edit-expense-button"
                          onClick={() => handleEditExpense(exp)}
                        >
                          Edit
                        </button>
                        <Trash2 className="expense-delete-icon"
                          onClick={() => handleDeleteExpense(exp.id)}
                        />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="expense-empty-state">
                      No expenses found. Add your first expense!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddExpense && (
        <div className="add-expense-overlay">
          <div className="add-expense-modal">
            <h3 className="add-expense-title">Add New Expense</h3>
            <div className="add-expense-form">
              <select className="expense-form-select"
                value={newExpense.petId}
                onChange={(e) => setNewExpense({ ...newExpense, petId: e.target.value })}
              >
                <option value="">Select Pet *</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id.toString()}>{pet.name}</option>
                ))}
              </select>
              <input className="expense-form-input"
                type="text"
                placeholder="Description *"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
              <input className="expense-form-input"
                type="number"
                placeholder="Amount *"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
              <select className="expense-form-select"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                <option value="Food">Food</option>
                <option value="Grooming">Grooming</option>
                <option value="Vet">Vet</option>
                <option value="Medicine">Medicine</option>
                <option value="Training">Training</option>
                <option value="Toys">Toys</option>
                <option value="Accessories">Accessories</option>
                <option value="Others">Others</option>/
              </select>
              <input className="expense-form-input"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
              <div className="expense-modal-buttons">
                <button className="save-expense-button" onClick={handleAddExpense}>
                  Save Expense
                </button>
                <button className="close-expense-button" onClick={() => setShowAddExpense(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingExpense && (
        <div className="add-expense-overlay">
          <div className="add-expense-modal">
            <h3 className="add-expense-title">Edit Expense</h3>
            <div className="add-expense-form">
              <input className="expense-form-input"
                type="text"
                placeholder="Description *"
                value={editingExpense.description}
                onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
              />
              <input className="expense-form-input"
                type="number"
                placeholder="Amount *"
                step="0.01"
                value={editingExpense.amount}
                onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
              />
              <select className="expense-form-select"
                value={editingExpense.category}
                onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
              >
                <option value="Food">Food</option>
                <option value="Grooming">Grooming</option>
                <option value="Vet">Vet</option>
                <option value="Medicine">Medicine</option>
                <option value="Training">Training</option>
                <option value="Toys">Toys</option>
                <option value="Accessories">Accessories</option>
                <option value="Others">Others</option>
              </select>
              <div className="expense-modal-buttons">
                <button className="save-expense-button" onClick={handleSaveEdit}>
                  Save Changes
                </button>
                <button className="close-expense-button" onClick={() => {
                  setShowEditModal(false);
                  setEditingExpense(null);
                }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;