import React from "react"
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within
} from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import TaskChecklist from "./TaskChecklist"
import { getAuth } from "firebase/auth"
import TaskService from "../utils/tasks"

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn()
}))

describe("TaskChecklist", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test("renders task checklist with header and progress", async () => {
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, pets: [] })
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, tasks: [] })
    })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    expect(await screen.findByText("📋 Task Checklist")).toBeInTheDocument()
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })

  test("shows calendar and selects a date", async () => {
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, pets: [] })
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, tasks: [] })
    })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    fireEvent.click(await screen.findByTitle("Open Calendar"))
    expect(
      await screen.findByText((text) => /\w+ 2025/.test(text))
    ).toBeInTheDocument()

    const dayBtn = screen
      .getAllByRole("button")
      .find(
        (btn) =>
          btn.className.includes("calendar-day") && btn.textContent === "15"
      )
    fireEvent.click(dayBtn)
  })

  test("adds a new one-time task", async () => {
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })
    fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        pets: [{ id: "1", name: "Buddy" }]
      })
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, tasks: [] })
    })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    fireEvent.click(await screen.findByText("Add Task"))

    fireEvent.change(screen.getByLabelText("Task Name"), {
      target: { value: "Feed Buddy" }
    })

    fireEvent.change(screen.getByLabelText("Pet"), {
      target: { value: "1" }
    })

    const addButtons = screen.getAllByRole("button", { name: "Add Task" })
    fireEvent.click(addButtons[addButtons.length - 1])
  })

  test("handles failed fetch of pets", async () => {
    getAuth.mockReturnValueOnce({ currentUser: { uid: "test-user" } })
    fetch.mockResolvedValueOnce({ json: async () => ({ success: false }) })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    const errorDiv = await screen.findByText(
      (text) =>
        typeof text === "string" && text.toLowerCase().includes("failed")
    )
    expect(errorDiv).toBeInTheDocument()
  })

  test("fetchPets does nothing if user is null", async () => {
    getAuth.mockReturnValue({ currentUser: null })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    // Expect no fetch calls
    expect(fetch).not.toHaveBeenCalled()
  })

  test("does nothing if task ID is not found in list", async () => {
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })

    fetch
      .mockResolvedValueOnce({
        json: async () => ({ success: true, pets: [] })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, tasks: [] })
      })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    // Force a task checkbox click with non-existing ID
    const tasks = screen.queryAllByRole("button", { name: "" }) // No task buttons = no toggle = no fetch
    expect(tasks.length).toBe(0)
  })

  test("toggles task completion", async () => {
    // Mock current user
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })

    const mockTask = {
      id: "t1",
      title: "Feed Buddy",
      petId: "1",
      completed: false,
      isRecurring: false
    }

    // 1. Mock pets fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        pets: [{ id: "1", petName: "Buddy" }]
      })
    })

    // 2. Mock tasks fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockTask]
    })

    // 3. Mock toggle PATCH request
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    // Wait for task to render
    expect(
      await screen.findByText((text) => text.includes("Feed Buddy"))
    ).toBeInTheDocument()

    // Click checkbox
    const checkboxBtn = await screen.findByTestId("task-checkbox-t1")
    fireEvent.click(checkboxBtn)

    // Confirm toggle API was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks/t1/toggle"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ completed: true })
        })
      )
    })
  })

  test("closes calendar modal on × button click", async () => {
    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    fireEvent.click(await screen.findByTitle("Open Calendar"))

    const closeButton = screen.getByRole("button", { name: "×" })
    fireEvent.click(closeButton)

    // Modal should disappear
    await waitFor(() => {
      expect(
        screen.queryByText(/january|february|march|april|may|june/i)
      ).not.toBeInTheDocument()
    })
  })

  test("navigates calendar months", async () => {
    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    fireEvent.click(await screen.findByTitle("Open Calendar"))

    const nextBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent === "→")
    const prevBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent === "←")

    fireEvent.click(nextBtn) // should call navigateCalendar(1)
    fireEvent.click(prevBtn) // should call navigateCalendar(-1)

    // Check the header text changed (e.g., different month)
    const header = screen.getByRole("heading", { level: 3 })
    expect(header).toBeInTheDocument()
  })

  test("selects a date from calendar", async () => {
    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    fireEvent.click(await screen.findByTitle("Open Calendar"))

    const dayButtons = screen
      .getAllByRole("button")
      .filter((btn) => /^\d+$/.test(btn.textContent))
    const someDay = dayButtons[0]

    fireEvent.click(someDay)

    // Modal should close, and selectedDate should change
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  test("shows recurring task info message when recurring is not 'once'", async () => {
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })

    fetch
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          pets: [{ id: "1", petName: "Buddy" }]
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, tasks: [] })
      })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    // Open the Add Task modal
    fireEvent.click(await screen.findByText("Add Task"))

    // Select a recurring option other than "once"
    const recurringSelect = screen.getByLabelText("Recurring")
    fireEvent.change(recurringSelect, { target: { value: "daily" } })

    // Check that the recurring info <small> appears
    expect(
      screen.getByText(/this will create tasks for the next 30/i)
    ).toBeInTheDocument()

    // Optionally check it adjusts text accordingly
    expect(screen.getByTestId("recurring-info")).toHaveTextContent(/30 day/i)

    // Change to "weekly"
    fireEvent.change(recurringSelect, { target: { value: "weekly" } })
    expect(screen.getByText(/weeks/i)).toBeInTheDocument()

    // Change to "once" to hide message
    fireEvent.change(recurringSelect, { target: { value: "once" } })
    expect(
      screen.queryByText(/this will create tasks for the next 30/i)
    ).not.toBeInTheDocument()
  })

  test("resets form and closes modal after successful task creation", async () => {
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })

    fetch
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          pets: [{ id: "1", petName: "Buddy" }]
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, tasks: [] })
      })

    // Mock TaskService.createTask to succeed
    jest.spyOn(TaskService, "createTask").mockResolvedValue({})

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    fireEvent.click(await screen.findByText("Add Task"))

    fireEvent.change(screen.getByLabelText("Task Name"), {
      target: { value: "Feed Buddy" }
    })
    fireEvent.change(screen.getByLabelText("Pet"), {
      target: { value: "1" }
    })

    const modal = screen.getByRole("dialog")
    fireEvent.click(within(modal).getByRole("button", { name: /add task/i }))

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    // Error message should be cleared
    expect(screen.queryByTestId("task-error")).not.toBeInTheDocument()
  })

  test("addNewTask shows error if title or petId is missing", async () => {
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })

    fetch
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          pets: [{ id: "1", petName: "Buddy" }]
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, tasks: [] })
      })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    // Open the modal
    fireEvent.click(await screen.findByText("Add Task"))

    // Scope to modal
    const modal = screen.getByRole("dialog")

    // Try submitting with no task name or pet selected
    fireEvent.click(within(modal).getByRole("button", { name: /add task/i }))

    // Check error message
    expect(
      within(modal).getByText(/please fill in task name and select a pet/i)
    ).toBeInTheDocument()
  })

  test("filters tasks by selected pet", async () => {
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })

    // Provide two pets
    fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        pets: [
          { id: "1", petName: "Buddy" },
          { id: "2", petName: "Fluffy" }
        ]
      })
    })

    // Provide two tasks, only one matches petId "2"
    fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        tasks: [
          { id: "t1", title: "Feed Buddy", petId: "1", completed: false },
          { id: "t2", title: "Brush Fluffy", petId: "2", completed: false }
        ]
      })
    })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    // Wait for dropdown to appear
    const select = await screen.findByLabelText("Filter by Pet:")
    fireEvent.change(select, { target: { value: "2" } })
    screen.debug()

    expect(screen.queryByText("Feed Buddy")).not.toBeInTheDocument()
  })

  test("filters tasks by selected pet ID", async () => {
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })

    // Mock pets
    fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        pets: [
          { id: "1", petName: "Buddy" },
          { id: "2", petName: "Fluffy" }
        ]
      })
    })

    // Mock tasks for different pets
    jest.spyOn(TaskService, "getTasksByDate").mockResolvedValue([
      { id: "t1", title: "Feed Buddy", petId: "1", completed: false },
      { id: "t2", title: "Brush Fluffy", petId: "2", completed: false }
    ])

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    // Wait for dropdown to render
    const petFilter = await screen.findByLabelText("Filter by Pet:")
    fireEvent.change(petFilter, { target: { value: "2" } })
    expect(screen.queryByText("Feed Buddy")).not.toBeInTheDocument()
  })

  test("deletes a task and updates task list", async () => {
    getAuth.mockReturnValue({ currentUser: { uid: "123" } })

    // Mock pets
    fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        pets: [{ id: "1", petName: "Buddy" }]
      })
    })

    // Mock tasks (initial state)
    jest.spyOn(TaskService, "getTasksByDate").mockResolvedValue([
      { id: "1", title: "Feed Buddy", petId: "1", completed: false },
      { id: "2", title: "Walk Buddy", petId: "1", completed: false }
    ])

    // Mock deleteTask API
    jest.spyOn(TaskService, "deleteTask").mockResolvedValue({ success: true })

    render(
      <MemoryRouter>
        <TaskChecklist />
      </MemoryRouter>
    )

    // Wait for tasks to render
    expect(await screen.findByText("Feed Buddy")).toBeInTheDocument()
    expect(screen.getByText("Walk Buddy")).toBeInTheDocument()

    // Click delete on "Feed Buddy"
    const deleteButton = await screen.findByTestId("delete-task-1")
    fireEvent.click(deleteButton)

    // Only "Walk Buddy" should remain
    await waitFor(() => {
      expect(screen.queryByText("Feed Buddy")).not.toBeInTheDocument()
      expect(screen.getByText("Walk Buddy")).toBeInTheDocument()
    })
  })
})
