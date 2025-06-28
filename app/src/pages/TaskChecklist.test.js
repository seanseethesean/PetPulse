import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskChecklist from './TaskChecklist';
import { BrowserRouter } from 'react-router-dom';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'mockUserId' }
  }))
}));

// Mock TaskService
jest.mock('../utils/tasks', () => ({
  getTasksByDate: jest.fn(() => Promise.resolve([])),
  toggleTaskCompletion: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  formatDateForAPI: jest.fn()
}));

describe('TaskChecklist ', () => {
  test('renders Task Checklist header', async () => {
    render(
      <BrowserRouter>
        <TaskChecklist />
      </BrowserRouter>
    );

    expect(await screen.findByRole('heading', { name: /Task Checklist/i })).toBeInTheDocument();
  });

  test('renders Add Task button', () => {
    render(
      <BrowserRouter>
        <TaskChecklist />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
  });
});