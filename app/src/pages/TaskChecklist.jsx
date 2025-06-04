import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import '../assets/TaskChecklist.css';
import Navbar from '../components/Navbar';

const TaskIcons = {
  feeding: '🍽️',
  walk: '🚶',
  medication: '💊',
  hydration: '💧',
  grooming: '✄',
  playtime: '🎾',
  training: '🎓',
  vet: '🏥',
  custom: '📝'
};

const TaskChecklist = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'feeding',
    petId: '',
    time: '',
    recurring: 'daily',
    notes: ''
  });
  const [task, setTasks] = useState([]);
  const [pets, setPets] = useState([]);
  const currentDate = Date.now();

  const getDateNavigation = () => {
    const dates = [];
    for (let i = -2; i <= 4; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }


  const completedTasks = 2 //tasks.filter(task => task,completed).length;
  const totalTasks = 3 // tasks.length;
  return (
    <div className="task-checklist">
      <div className="taskheader">
        <div> <Navbar> </Navbar> </div>
        <h1>Task Checklist</h1>

        <div className="progress-summary">
          <div className="progressCircle">
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
              <text
                x="30"
                y="35"
                textAnchor="middle"
                fontSize="14"
                fill="#111"
              >
                {completedTasks}/{totalTasks}
              </text>
            </svg>
            <div className="progress-info">
              <p>{completedTasks} completed</p>
              <p>{totalTasks - completedTasks} remaining</p>
            </div>
          </div>
        </div>

        <div className="date-navigation">
          {getDateNavigation().map((date, index) => (
            <button
              key={index}
              className={`date-button ${date.toDateString() === date.toDateString() ? 'active' : ''}`}
              onClick={() => setDate(date)}
            >
              <span className="date-day">{date.getDate()}</span>
              <span className="date-weekday">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            </button>
          ))}

        </div>

      </div>
    </div>

  );
};

export default TaskChecklist;