import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskChecklist from "./TaskChecklist";
import { getAuth } from "firebase/auth";
import TaskService from "../utils/tasks";

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: "mockUserId" }
  }))
}));

// Mock TaskService
jest.mock("../utils/tasks", () => ({
  getTasksByDate: jest.fn(),
  toggleTaskCompletion: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  formatDateForAPI: jest.fn((date) => date.toISOString().split("T")[0])
}));

// Mock fetch for pets
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        success: true,
        pets: [{ id: "1", petName: "Milo", color: "#FFC0CB" }]
      })
  })
);

describe("TaskChecklist Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing and fetches pets and tasks", async () => {
    TaskService.getTasksByDate.mockResolvedValue([
      {
        id: "task1",
        title: "Feed Milo",
        petId: "1",
        type: "feeding",
        completed: false,
        date: new Date().toISOString(),
        recurring: "once"
      }
    ]);

    render(<TaskChecklist />);

    expect(await screen.findByText("📋 Task Checklist")).toBeInTheDocument();
    expect(await screen.findByText("Feed Milo")).toBeInTheDocument();
    expect(await screen.findByText("Milo")).toBeInTheDocument();
  });

  test("allows toggling task completion", async () => {
    TaskService.getTasksByDate.mockResolvedValue([
      {
        id: "task2",
        title: "Walk Milo",
        petId: "1",
        type: "walk",
        completed: false,
        date: new Date().toISOString(),
        recurring: "once"
      }
    ]);

    render(<TaskChecklist />);

    const toggleBtn = await screen.findByRole("button", { name: "" });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(TaskService.toggleTaskCompletion).toHaveBeenCalledWith("task2", true);
    });
  });

  test("displays error when tasks fail to load", async () => {
    TaskService.getTasksByDate.mockRejectedValue(new Error("Fetch error"));

    render(<TaskChecklist />);

    expect(await screen.findByText(/Failed to load tasks/i)).toBeInTheDocument();
  });

  test("opens add task modal when clicking Add Task button", async () => {
    TaskService.getTasksByDate.mockResolvedValue([]);

    render(<TaskChecklist />);

    const addBtn = await screen.findByText("Add Task");
    fireEvent.click(addBtn);

    expect(await screen.findByText("Add New Task")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter task name")).toBeInTheDocument();
  });
});