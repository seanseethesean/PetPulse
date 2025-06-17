import React, { useState, useEffect } from 'react';
import '../assets/TaskChecklist.css';
import Navbar from '../components/Navbar';
import TaskService from '../utils/tasks';
import { getAuth } from 'firebase/auth';

const TaskIcons = {
  feeding: '🍽️',
  walk: '🚶',
  medication: '💊',
  hydration: '💧',
  grooming: '✂️',
  playtime: '🎾',
  training: '🎓',
  vet: '🏥',
  custom: '📝',
  calendar: '📅'
};

const TaskChecklist = () => {
  const [pets, setPets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPetFilter, setSelectedPetFilter] = useState('all');

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'feeding',
    petId: '',
    time: '',
    recurring: 'daily',
    notes: ''
  });

  const auth = getAuth();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/pets?userId=${user.uid}`);
        const data = await res.json();
        if (data.success) {
          setPets(data.pets);
        } else {
          setError(data.error || 'Failed to load pets');
        }
      } catch (err) {
        console.error('Failed to fetch pets:', err);
        setError('Failed to load pets');
      }
    };
    fetchPets();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  // Filter tasks when tasks or pet filter changes
  useEffect(() => {
    if (selectedPetFilter === 'all') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.petId === selectedPetFilter));
    }
  }, [tasks, selectedPetFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) return;
      const tasksData = await TaskService.getTasksByDate(selectedDate, user.uid);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      setTasks(updatedTasks);
      await TaskService.toggleTaskCompletion(taskId, !task.completed);
    } catch (err) {
      setError('Failed to update task: ' + err.message);
    }
  };

  // Helper function to generate recurring task dates
  const generateRecurringDates = (startDate, recurring) => {
    let count;
    switch (recurring) {
      case 'daily':
        count = 30;  // 30 days
        break;
      case 'weekly':
        count = 4;   // 4 weeks
        break;
      case 'monthly':
        count = 12;  // 12 months
        break;
      default:
        return [startDate];
    }
    const dates = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < count; i++) {
      dates.push(new Date(current));
      
      switch (recurring) {
        case 'daily':
          current.setDate(current.getDate() + 1);
          break;
        case 'weekly':
          current.setDate(current.getDate() + 7);
          break;
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        default:
          return [startDate]; // For 'once'
      }
    }
    
    return dates;
  };

  const addNewTask = async () => {
    if (!newTask.title || !newTask.petId) {
      setError('Please fill in task name and select a pet');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Generate dates for recurring tasks
      const dates = newTask.recurring === 'once' 
        ? [selectedDate] 
        : generateRecurringDates(selectedDate, newTask.recurring);

      // Create tasks for all dates
      const taskPromises = dates.map(date => {
        const taskData = {
          ...newTask,
          petId: newTask.petId.toString(),
          date: TaskService.formatDateForAPI(date),
          userId: user.uid,
          completed: false,
          isRecurring: newTask.recurring !== 'once',
          recurringType: newTask.recurring
        };
        return TaskService.createTask(taskData);
      });

      await Promise.all(taskPromises);
      await loadTasks();
      
      setNewTask({
        title: '',
        type: 'feeding',
        petId: '',
        time: '',
        recurring: 'daily',
        notes: ''
      });
      setShowAddTask(false);
      setError(null);
    } catch (err) {
      setError('Failed to create task: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await TaskService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task: ' + err.message);
    }
  };

  const generateCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateCalendar = (direction) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCalendarDate(newDate);
  };

  const selectCalendarDate = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const completedTasks = filteredTasks.filter(task => task.completed).length;
  const totalTasks = filteredTasks.length;

  const getPetById = (petId) => pets.find(pet => pet.id.toString() === petId.toString());

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getDateNavigation = () => {
    const dates = [];
    for (let i = 0; i <= 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  return (
    <div className="task-checklist">
      <div className="task-header">
        <Navbar />
        <h1>📋 Task Checklist</h1>
        <div className="progress-summary">
          <div className="progress-circle">
            <svg width="60" height="60">
              <circle
                cx="30"
                cy="30"
                r="25"
                stroke="#E5E7EB"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r="25"
                stroke="#10B981"
                strokeWidth="5"
                fill="none"
                strokeDasharray={`${totalTasks > 0 ? (completedTasks / totalTasks) * 157 : 0} 157`}
                strokeDashoffset="0"
                transform="rotate(-90 30 30)"
              />
            </svg>
            <span className="progress-text">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="progress-info">
            <p>{completedTasks} completed</p>
            <p>{totalTasks - completedTasks} remaining</p>
          </div>
        </div>
      </div>

      <div className="date-navigation">
        {getDateNavigation().map((date, index) => (
          <button key={index}
            className={`date-button ${selectedDate.toDateString() === date.toDateString() ? 'active' : ''}`}
            onClick={() => setSelectedDate(date)}>
            <span className="date-day">{date.getDate()}</span>
            <span className="date-weekday">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          </button>
        ))}
      </div>

      <div className="selected-date">
        <div className="selected-date-header">
          <div>
            <h2>{formatDate(selectedDate)}</h2>
            <p>{selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          <button className="calendar-icon-btn"
            onClick={() => setShowCalendar(true)}
            title="Open Calendar">
            📅
          </button>
        </div>
      </div>

      {/* Pet Filter */}
      <div className="pet-filter">
        <label htmlFor="pet-filter">Filter by Pet:</label>
        <select id="pet-filter"
          value={selectedPetFilter} 
          onChange={(e) => setSelectedPetFilter(e.target.value)}
          className="pet-filter-select">
          <option value="all">All Pets</option>
          {pets.map(pet => (
            <option key={pet.id} value={pet.id.toString()}>
              {pet.name}
            </option>
          ))}
        </select>
      </div>

      <button className="floating-add-btn"
        onClick={() => setShowAddTask(true)}>
        Add Task
      </button>

      <div className="tasks-container">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <p>
              {selectedPetFilter === 'all' 
                ? 'No tasks scheduled for this day' 
                : `No tasks for ${getPetById(selectedPetFilter)?.name || 'selected pet'} on this day`
              }
            </p>
            <button className="add-task-btn" onClick={() => setShowAddTask(true)}>
              Add Your First Task
            </button>
          </div>
        ) : (
          <>
            {filteredTasks.map(task => {
              const pet = getPetById(task.petId);
              return (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <button className="task-checkbox"
                    onClick={() => toggleTaskCompletion(task.id)}>
                    {task.completed && <span className="checkmark">✓</span>}
                  </button>

                  <div className="task-content">
                    <div className="task-main">
                      <div className="task-icon">{TaskIcons[task.type]}</div>
                      <div className="task-info">
                        <h3>
                          {task.title}
                          {task.isRecurring && (
                            <span className="recurring-badge" title={`Recurring ${task.recurringType}`}>
                              🔄
                            </span>
                          )}
                        </h3>
                        <div className="task-meta">
                          <span className="task-pet" style={{ color: pet?.color }}>
                            {pet?.name}
                          </span>
                          {task.time && <span className="task-time">{task.time}</span>}
                        </div>
                      </div>
                    </div>

                    {task.notes && (
                      <div className="task-notes">
                        <p>{task.notes}</p>
                      </div>
                    )}
                  </div>

                  <button className="task-delete" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* New Task modal */}
      {showAddTask && (
        <div className="modal-overlay">
          <div className="add-task-modal">
            <div className="modal-header">
              <h3>Add New Task</h3>
              <button className="close-btn"
                onClick={() => setShowAddTask(false)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Task Name</label>
                <input type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task name" />
              </div>

              <div className="form-group">
                <label>Task Type</label>
                <select value={newTask.type}
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}>
                  <option value="feeding">Feeding</option>
                  <option value="walk">Walk</option>
                  <option value="medication">Medication</option>
                  <option value="hydration">Hydration</option>
                  <option value="grooming">Grooming</option>
                  <option value="playtime">Playtime</option>
                  <option value="training">Training</option>
                  <option value="vet">Vet Visit</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="form-group">
                <label>Pet</label>
                <select value={newTask.petId}
                  onChange={(e) => setNewTask({ ...newTask, petId: e.target.value })}>
                  <option value="">Select a pet</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Time</label>
                <input type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Recurring</label>
                <select value={newTask.recurring}
                  onChange={(e) => setNewTask({ ...newTask, recurring: e.target.value })}>
                  <option value="once">One Time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                {newTask.recurring !== 'once' && (
                  <small className="recurring-info">
                    This will create tasks for the next 30 {newTask.recurring.replace('ly', '')} periods
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  placeholder="Add any notes or instructions"
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button className="cancel-btn"
                  onClick={() => setShowAddTask(false)}>
                  Cancel
                </button>
                <button className="save-btn"
                  onClick={addNewTask}
                  disabled={loading}>
                  {loading ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar modal */}
      {showCalendar && (
        <div className="modal-overlay">
          <div className="calendar-modal">
            <button className="calendar-close-btn"
              onClick={() => setShowCalendar(false)}>
              ×
            </button>
            <div className="calendar-header">
              <button className="calendar-nav-btn"
                onClick={() => navigateCalendar(-1)}>
                ←
              </button>
              <h3>
                {calendarDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
              <button className="calendar-nav-btn"
                onClick={() => navigateCalendar(1)}>
                →
              </button>
            </div>

            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}
              </div>

              <div className="calendar-days">
                {generateCalendarDays(calendarDate.getFullYear(), calendarDate.getMonth()).map((date, index) => (
                  <button key={index}
                    className={`calendar-day ${date ? 
                      (date.toDateString() === selectedDate.toDateString() ? 'selected' :
                        date.toDateString() === new Date().toDateString() ? 'today' : '')
                      : 'empty'
                      }`}
                    onClick={() => date && selectCalendarDate(date)}
                    disabled={!date}>
                    {date ? date.getDate() : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskChecklist;