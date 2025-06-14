import React, { useState, useMemo } from "react"
import { Plus, DollarSign, Filter, Calendar, Trash2, PawPrint } from 'lucide-react';
import Navbar from "../components/Navbar";
import '../assets/ExpenseTracker.css';

const ExpenseTracker = () => {

  const [showAddExpense, setShowAddExpense] = useState(false);

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
            <p className="expense-amount">$0.00</p>
          </div>
        </div>

        {/* Pet filter */}
        <div className="expense-filter-wrapper">
          <div className="expense-filter">
            <div className="filter-container">
              <Filter className="filter-icon" />
              {/* need to change to pets from database */}
              <select className="pet-filter-select">
                <option value="all">All Pets</option>
                <option value="Bella">Bella</option>
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
                <li>
                  <span>Food</span>
                  <span>$50</span>
                </li>
                <li>
                  <span>Grooming</span>
                  <span>$50</span>
                </li>
                <li>
                  <span>Vet</span>
                  <span>$50</span>
                </li>
                <li>
                  <span>Medicine</span>
                  <span>$50</span>
                </li>
                <li>
                  <span>Training</span>
                  <span>$50</span>
                </li>
                <li>
                  <span>Toys</span>
                  <span>$50</span>
                </li>
                <li>
                  <span>Accessories</span>
                  <span>$50</span>
                </li>
                <li>
                  <span>Others</span>
                  <span>$50</span>
                </li>
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
                <tr>
                  <td>01/01/2023</td>
                  <td>Bella</td>
                  <td>Food</td>
                  <td>Dog food purchase</td>
                  <td>$50.00</td>
                  <td>
                    <div className="expense-actions">
                      <button className="edit-expense-button">Edit</button>
                      <Trash2 className="delete-icon" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddExpense && (
        <div className="add-expense-modal">
          <h3>Add new expense</h3>
          <div className="add-expense-form">


          </div>
        </div>
      )}

    </div>
  )

}

export default ExpenseTracker;