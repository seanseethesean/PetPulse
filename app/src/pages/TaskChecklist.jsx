import React, { useState, useEffect } from 'react';
import '../assets/TaskChecklist.css';
import Navbar from '../components/Navbar';

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pets, setPets] = useState([
    { id: 1, name: 'Buddy', type: 'Dog', color: '#FF6B6B' },
    { id: 2, name: 'Whiskers', type: 'Cat', color: '#4ECDC4' },
    { id: 3, name: 'Charlie', type: 'Bird', color: '#45B7D1' }
  ]);

  // change to tasks from database
  const sampleTasks = [ // key value pairs
    {
      id: 1,
      title: 'Morning Feed',
      type: 'feeding',
      petId: 1,
      time: '08:00',
      completed: false,
      recurring: 'daily',
      notes: '1 cup of kibble'
    },
    {
      id: 2,
      title: 'Walk in Park',
      type: 'walk',
      petId: 1,
      time: '09:30',
      completed: true,
      recurring: 'daily',
      notes: '30 minutes'
    }
  ];

  // Calendar
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const generateCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
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

  // Tasks
  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'feeding',
    petId: '',
    time: '',
    recurring: 'daily',
    notes: ''
  });
  
  useEffect(() => {
    setTasks(sampleTasks); // load or filter tasks
  }, [selectedDate]); //re-run this code whenever selectedDate changes

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const addNewTask = () => {
    if (!newTask.title || !newTask.petId) return;
    const task = {
      id: Date.now(),
      ...newTask,
      completed: false,
      petId: parseInt(newTask.petId)
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      type: 'feeding',
      petId: '',
      time: '',
      recurring: 'daily',
      notes: ''
    });
    setShowAddTask(false);
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  const getPetById = (petId) => pets.find(pet => pet.id === petId);

  // Date
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
    for (let i = 0; i <= 7; i++) { // the day to the next week
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
        <h1>Task Checklist</h1>
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
                strokeDasharray={`${(completedTasks / totalTasks) * 157} 157`}
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
          <button
            className="calendar-icon-btn"
            onClick={() => setShowCalendar(true)}
            title="Open Calendar">
            📅
          </button>
        </div>
      </div>

      <button className="floating-add-btn"
        onClick={() => setShowAddTask(true)}>
        Add Task
      </button>

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks scheduled for this day</p>
            <button className="add-task-btn" onClick={() => setShowAddTask(true)}>
              Add Your First Task
            </button>
          </div>
        ) : (
          <>
            {tasks.map(task => {
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
                        <h3>{task.title}</h3>
                        <div className="task-meta">
                          <span className="task-pet" style={{ color: pet?.color }}>
                            {pet?.name}
                          </span>
                          {task.time && <span className="task-time">{task.time}</span>}
                        </div>
                      </div>
                    </div>

                    {task.notes && ( // boolean to check if task.notes is empty
                      <div className="task-notes">
                        <p>{task.notes}</p>
                      </div>
                    )}
                  </div>

                  <button className="task-delete" onClick={() => {
                    setTasks(tasks.filter(t => t.id !== task.id));
                  }}>Delete</button>

                </div>
              );

            })}
          </>
        )}
      </div>

      {/* New Task modal */}
      {showAddTask && (
        <div className="modal-overlay"> {/* Modal creates a mode to temporarily block interaction with the rest of the interface */}
          <div className="add-task-modal">

            <div className="modal-header">
              <h3>Add New Task</h3>
              <button className="close-btn"
                onClick={() => setShowAddTask(false)}>
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
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value=" once">One Time</option>
                </select>
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
                  onClick={addNewTask}>
                  Add Task
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