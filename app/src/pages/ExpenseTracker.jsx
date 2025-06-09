import React, { useState, useMemo } from "react"
import { Plus, DollarSign, Filter, Calendar, Trash2, PawPrint } from 'lucide-react';
import '../assets/ExpenseTracker.css';

const ExpenseTracker = () => {


  return (
    <div className="expense-tracker">

      <div className="expense-tracker-container">

        {/* Header */}
        <div className="expense-tracker-header">
          <div className="expense-header-title">
            <PawPrint className="paw-print-icon" />
            <h1> Expense Tracker</h1>
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
            <button className="add-expense">+ Add Expense</button>
          </div>
        </div>

      </div>

    </div>
  )

}

export default ExpenseTracker;