// Mock Firebase auth
jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: { uid: "test-user-id" }
  })
}))

import React from "react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import PetJournal from "./PetJournal"

// Mock JournalService
import JournalService from "../utils/journal"
jest.mock("../utils/journal")

const mockPets = [
  { id: 1, petName: "Buddy" },
  { id: 2, petName: "Fluffy" }
]

const mockEntries = [
  {
    id: 1,
    title: "Morning walk",
    content: "Went for a walk in the park.",
    mood: "happy",
    activities: ["Walk"],
    date: "2025-07-01"
  }
]

beforeEach(() => {
  // Mock /api/pets response
  global.fetch = jest.fn((url) => {
    if (url.includes("/api/pets") && url.includes("userId=test-user-id")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            pets: [{ id: 1, petName: "Buddy" }]
          })
      })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })

  JournalService.getEntries.mockResolvedValue({
    success: true,
    entries: mockEntries
  })
})

afterEach(() => {
  // Don't clear static `jest.mock()` declarations
  JournalService.getEntries.mockClear()
  JournalService.createEntry?.mockClear?.()
  JournalService.deleteEntry?.mockClear?.()
  global.fetch?.mockClear?.()
  window.alert?.mockClear?.()
  console.error?.mockClear?.()
})

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

test("selecting a pet loads journal entries", async () => {
  renderWithRouter(<PetJournal />)

  // Wait for pet options to load
  const select = await screen.findByRole("combobox")
  await waitFor(() =>
    expect(screen.getByRole("option", { name: "Buddy" })).toBeInTheDocument()
  )

  // Select "Buddy"
  userEvent.selectOptions(select, "Buddy")

  // Wait for journal entries to load
  await waitFor(() => {
    expect(JournalService.getEntries).toHaveBeenCalledWith(
      "test-user-id",
      "Buddy"
    )
  })

  // Entry should be rendered
  expect(await screen.findByText("Morning walk")).toBeInTheDocument()
  expect(screen.getByText("Went for a walk in the park.")).toBeInTheDocument()
})

test("loads selectedPet from localStorage", async () => {
  localStorage.setItem("selectedPetId", "Buddy")

  renderWithRouter(<PetJournal />)
  await screen.findByRole("option", { name: "Buddy" })

  // Should have called fetchJournalEntries with Buddy
  await waitFor(() => {
    expect(JournalService.getEntries).toHaveBeenCalledWith(
      "test-user-id",
      "Buddy"
    )
  })

  localStorage.removeItem("selectedPetId")
})

test("does not fetch journal entries if user or pet is missing", async () => {
  JournalService.getEntries.mockClear()
  renderWithRouter(<PetJournal />)
  expect(JournalService.getEntries).not.toHaveBeenCalled()
})

test("renders entry with no activities gracefully", async () => {
  JournalService.getEntries.mockResolvedValueOnce({
    success: true,
    entries: [
      {
        id: 3,
        title: "Lazy Day",
        content: "Just slept all day",
        mood: "sleepy",
        date: "2025-07-02",
        activities: [] // empty
      }
    ]
  })

  renderWithRouter(<PetJournal />)
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")

  expect(await screen.findByText("Lazy Day")).toBeInTheDocument()
  expect(screen.queryByText("Activities:")).not.toBeInTheDocument()
})

test("renders default emoji for unknown mood", async () => {
  JournalService.getEntries.mockResolvedValueOnce({
    success: true,
    entries: [
      {
        id: 5,
        title: "Strange mood",
        content: "Something odd",
        mood: "unknown",
        activities: [],
        date: "2025-07-05"
      }
    ]
  })

  renderWithRouter(<PetJournal />)
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")

  expect(await screen.findByText("Strange mood")).toBeInTheDocument()
  expect(screen.getByText("😊")).toBeInTheDocument() // default emoji
})

test("handles fetch pets failure gracefully", async () => {
  global.fetch = jest.fn(() => Promise.reject("API is down"))

  renderWithRouter(<PetJournal />)
  await waitFor(() => {
    expect(screen.getByText("Select Pet:")).toBeInTheDocument()
  })
})

test("toggles activity selection correctly", async () => {
  renderWithRouter(<PetJournal />)

  // Wait for pets dropdown to appear
  await screen.findByRole("combobox")

  // Wait for the "Buddy" option to appear before selecting
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")

  // Open the add entry form
  userEvent.click(await screen.findByText("Add New Entry"))

  // Select and unselect "Play"
  const playBtn = screen.getByText("Play")
  userEvent.click(playBtn) // select
  userEvent.click(playBtn) // unselect

  expect(playBtn).toBeInTheDocument()
})

test("handles createEntry throwing error", async () => {
  JournalService.createEntry = jest.fn(() =>
    Promise.reject(new Error("save failed"))
  )
  console.error = jest.fn()

  renderWithRouter(<PetJournal />)
  userEvent.selectOptions(await screen.findByRole("combobox"), "Buddy")
  userEvent.click(await screen.findByText("Add New Entry"))

  userEvent.type(screen.getByLabelText(/Title:/i), "Error Test")
  userEvent.click(screen.getByText("Save Entry"))

  await waitFor(() =>
    expect(console.error).toHaveBeenCalledWith(
      "Error saving entry:",
      expect.any(Error)
    )
  )
})

test("handles deleteEntry throwing error", async () => {
  JournalService.getEntries.mockResolvedValueOnce({
    success: true,
    entries: [
      {
        id: "1",
        title: "Test Entry",
        content: "Something",
        mood: "happy",
        activities: [],
        date: "2025-07-21"
      }
    ]
  })

  JournalService.deleteEntry = jest.fn(() =>
    Promise.reject(new Error("delete failed"))
  )
  console.error = jest.fn()
  window.confirm = jest.fn(() => true)

  renderWithRouter(<PetJournal />)

  // Wait for Buddy to be available before selecting
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")

  // Wait for the entry to load
  await screen.findByText("Test Entry")

  // Click delete
  userEvent.click(screen.getByText("Delete"))

  // Expect error log
  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "Error deleting entry:",
      expect.any(Error)
    )
  })
})

test("does not show alert if title and mood are filled", async () => {
  renderWithRouter(<PetJournal />)

  // Wait for pet options and select Buddy
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")

  // Click Add New Entry
  userEvent.click(await screen.findByText("Add New Entry"))

  // Fill in a valid title
  userEvent.type(screen.getByLabelText(/Title:/i), "Valid Entry")

  // Set up alert mock
  window.alert = jest.fn()

  // Submit
  userEvent.click(screen.getByText("Save Entry"))

  // Expect alert NOT to be called
  await waitFor(() => {
    expect(window.alert).not.toHaveBeenCalled()
  })
})

test("filters entries by date and mood correctly", async () => {
  JournalService.getEntries.mockResolvedValueOnce({
    success: true,
    entries: [
      {
        id: "1",
        title: "Play Date",
        date: "2025-07-21",
        mood: "playful",
        content: "Fun day!",
        activities: ["Play"]
      },
      {
        id: "2",
        title: "Sleep Day",
        date: "2025-07-20",
        mood: "sleepy",
        content: "Long nap.",
        activities: ["Sleep"]
      }
    ]
  })

  renderWithRouter(<PetJournal />)

  // Wait for pet option to be ready before selecting
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")

  // Wait for entries to load
  await screen.findByText("Play Date")
  await screen.findByText("Sleep Day")

  // Filter by mood
  userEvent.selectOptions(screen.getByDisplayValue("All moods"), "playful")

  expect(screen.queryByText("Sleep Day")).not.toBeInTheDocument()
  expect(screen.getByText("Play Date")).toBeInTheDocument()

  // Filter by date
  const dateInput = screen.getByPlaceholderText(/Filter by date/i)
  userEvent.clear(dateInput)
  userEvent.type(dateInput, "2025-07-21")

  expect(screen.getByText("Play Date")).toBeInTheDocument()
})

test("shows error if save fails (result.success = false)", async () => {
  JournalService.createEntry = jest.fn(() =>
    Promise.resolve({ success: false, error: "mock failure" })
  )
  console.error = jest.fn()

  renderWithRouter(<PetJournal />)
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")
  userEvent.click(await screen.findByText("Add New Entry"))
  userEvent.type(screen.getByLabelText(/Title:/i), "Fail Entry")
  userEvent.click(screen.getByText("Save Entry"))

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "Failed to save entry: unknown error",
      "mock failure"
    )
  })
})

test("does not delete if user cancels confirm dialog", async () => {
  window.confirm = jest.fn(() => false) // user clicks 'Cancel'
  JournalService.getEntries.mockResolvedValueOnce({
    success: true,
    entries: [
      {
        id: "1",
        title: "To Delete",
        content: "...",
        mood: "happy",
        date: "2025-07-21",
        activities: []
      }
    ]
  })

  renderWithRouter(<PetJournal />)
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")
  await screen.findByText("To Delete")

  userEvent.click(screen.getByText("Delete"))

  expect(JournalService.deleteEntry).not.toHaveBeenCalled()
})
test("logs error if deleteEntry returns success = false", async () => {
  JournalService.getEntries.mockResolvedValueOnce({
    success: true,
    entries: [
      {
        id: "1",
        title: "To Fail Delete",
        content: "...",
        mood: "happy",
        date: "2025-07-21",
        activities: []
      }
    ]
  })

  JournalService.deleteEntry = jest.fn(() =>
    Promise.resolve({ success: false, error: "failed" })
  )
  window.confirm = jest.fn(() => true)
  console.error = jest.fn()

  renderWithRouter(<PetJournal />)
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")
  await screen.findByText("To Fail Delete")

  userEvent.click(screen.getByText("Delete"))

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "Failed to delete entry:",
      "failed"
    )
  })
})

test("logs error if deleteEntry throws error", async () => {
  JournalService.getEntries.mockResolvedValueOnce({
    success: true,
    entries: [
      {
        id: "1",
        title: "Throw Delete",
        content: "...",
        mood: "happy",
        date: "2025-07-21",
        activities: []
      }
    ]
  })

  JournalService.deleteEntry = jest.fn(() =>
    Promise.reject(new Error("delete failed"))
  )
  window.confirm = jest.fn(() => true)
  console.error = jest.fn()

  renderWithRouter(<PetJournal />)
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")
  await screen.findByText("Throw Delete")

  userEvent.click(screen.getByText("Delete"))

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "Error deleting entry:",
      expect.any(Error)
    )
  })
})

test("handles success alert for createEntry", async () => {
  jest.spyOn(JournalService, "createEntry").mockResolvedValue({ success: true })
  window.alert = jest.fn() // must be BEFORE click

  renderWithRouter(<PetJournal />)

  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")

  userEvent.click(await screen.findByText("Add New Entry"))

  userEvent.type(screen.getByLabelText(/Title:/i), "Test Entry")
  userEvent.type(screen.getByLabelText(/Content:/i), "Test content")

  userEvent.click(screen.getByText("Save Entry"))

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Entry added!")
  })
})

test("handles failure in createEntry", async () => {
  jest
    .spyOn(JournalService, "createEntry")
    .mockResolvedValue({ success: false })
  console.error = jest.fn()

  renderWithRouter(<PetJournal />)
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")

  userEvent.click(await screen.findByText("Add New Entry"))
  userEvent.type(screen.getByLabelText(/Title:/i), "Fail Save")
  userEvent.type(screen.getByLabelText(/Content:/i), "Failing content")

  userEvent.click(screen.getByText("Save Entry"))

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "Failed to save entry: unknown error",
      undefined
    )
  })
})

test("does not fetch journal entries if user or pet is missing", async () => {
  // Mock no user
  jest
    .spyOn(require("firebase/auth"), "getAuth")
    .mockReturnValue({ currentUser: null })

  renderWithRouter(<PetJournal />)

  // Should not crash or throw
  await waitFor(() => {
    expect(screen.queryByText("Journal Entries")).not.toBeInTheDocument()
  })
})

test("handles edit entry correctly", async () => {
  // Re-apply Firebase Auth mock if needed (safe redundancy)
  jest
    .spyOn(require("firebase/auth"), "getAuth")
    .mockReturnValue({ currentUser: { uid: "test-user-id" } })

  // Mock journal entry to edit
  JournalService.getEntries.mockResolvedValueOnce({
    success: true,
    entries: [
      {
        id: "1",
        title: "Edit Me",
        content: "Content to edit",
        mood: "happy",
        activities: ["Play"],
        date: "2025-07-22"
      }
    ]
  })

  renderWithRouter(<PetJournal />)

  // Select pet
  await screen.findByRole("option", { name: "Buddy" })
  userEvent.selectOptions(screen.getByRole("combobox"), "Buddy")

  // Wait for the entry to appear
  await screen.findByText("Edit Me")

  // Click the "Edit" button
  userEvent.click(screen.getByText("Edit"))

  screen.debug() // Logs current DOM output

  expect(screen.getByText("Edit Entry")).toBeInTheDocument()
  expect(screen.getByText("Update Entry")).toBeInTheDocument()
})