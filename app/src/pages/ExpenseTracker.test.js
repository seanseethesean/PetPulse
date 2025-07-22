import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ExpenseTracker from "../pages/ExpenseTracker"
import { MemoryRouter } from "react-router-dom"
import ExpenseService from "../utils/expenses"
import { getAuth } from "firebase/auth"

jest.mock("firebase/auth", () => {
  return {
    getAuth: () => ({
      currentUser: { uid: "mockUser" },
      onAuthStateChanged: jest.fn((cb) => {
        cb({ uid: "mockUser" })
        return () => {} // unsubscribe
      })
    })
  }
})

jest.mock("../utils/expenses")

const mockPets = [
  { id: 1, petName: "Fluffy" },
  { id: 2, petName: "Rex" }
]

const mockExpenses = [
  {
    id: 101,
    userId: "mockUser",
    petId: "1",
    petName: "Fluffy",
    amount: 20,
    category: "Food",
    description: "Chicken",
    date: "2024-07-01"
  }
]

describe("ExpenseTracker", () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/api/pets")) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, pets: mockPets })
        })
      }
      return Promise.resolve({ json: () => Promise.resolve({}) })
    })

    ExpenseService.getExpenses.mockResolvedValue([...mockExpenses])
    ExpenseService.createExpense.mockResolvedValue({
      ...mockExpenses[0],
      id: 102,
      description: "Dog Food",
      amount: 50
    })
    ExpenseService.updateExpense.mockResolvedValue({})
    ExpenseService.deleteExpense.mockResolvedValue({})
  })

  const renderWithRouter = (ui) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>)
  }

  it("renders total and recent expenses", async () => {
    renderWithRouter(<ExpenseTracker />)
    expect(await screen.findByText("Total Expenses")).toBeInTheDocument()
    expect(await screen.findByText("Chicken")).toBeInTheDocument()
  })

  it("adds a new expense", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Add Expense"))

    fireEvent.change(screen.getByPlaceholderText("Description *"), {
      target: { value: "Dog Food" }
    })
    fireEvent.change(screen.getByPlaceholderText("Amount *"), {
      target: { value: "50" }
    })

    fireEvent.click(screen.getByText("Save Expense"))

    await waitFor(() => {
      expect(screen.getByText("Dog Food")).toBeInTheDocument()
    })
  })

  it("edits an expense", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Edit"))

    const descInput = screen.getByPlaceholderText("Description *")
    fireEvent.change(descInput, { target: { value: "Updated Chicken" } })

    fireEvent.click(screen.getByText("Save Changes"))

    await waitFor(() => {
      expect(screen.getByText("Updated Chicken")).toBeInTheDocument()
    })
  })

  it("deletes an expense", async () => {
    window.confirm = jest.fn(() => true) // mock confirm()

    renderWithRouter(<ExpenseTracker />)

    // Wait for expenses to load
    await screen.findByText("Chicken")

    const editButtons = await screen.findAllByText("Edit")
    const deleteIcon = editButtons[0].parentElement.querySelector(
      ".expense-delete-icon"
    )

    expect(deleteIcon).toBeInTheDocument()
    fireEvent.click(deleteIcon)

    await waitFor(() => {
      expect(screen.queryByText("Chicken")).not.toBeInTheDocument()
    })
  })

  it("shows empty state when no expenses", async () => {
    ExpenseService.getExpenses.mockResolvedValue([])
    renderWithRouter(<ExpenseTracker />)
    expect(await screen.findByText(/No expenses found/i)).toBeInTheDocument()
  })

  it("does not add expense if fields are missing", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Add Expense"))

    // Leave fields empty and submit
    fireEvent.click(screen.getByText("Save Expense"))

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Description *")).toBeInTheDocument()
    })
  })

  it("does not save edit if fields are missing", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Edit"))

    const descInput = screen.getByPlaceholderText("Description *")
    fireEvent.change(descInput, { target: { value: "" } })

    fireEvent.click(screen.getByText("Save Changes"))

    await waitFor(() => {
      expect(screen.getByText("Save Changes")).toBeInTheDocument()
    })
  })

  it("does not delete expense if user cancels confirm", async () => {
    window.confirm = jest.fn(() => false) // Cancel delete

    renderWithRouter(<ExpenseTracker />)
    await screen.findByText("Chicken")

    const editButtons = await screen.findAllByText("Edit")
    const deleteIcon = editButtons[0].parentElement.querySelector(
      ".expense-delete-icon"
    )

    fireEvent.click(deleteIcon)

    expect(screen.getByText("Chicken")).toBeInTheDocument() // Still visible
  })

  it("filters expenses by selected pet", async () => {
    renderWithRouter(<ExpenseTracker />)

    await screen.findByText("Total Expenses")

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "2" } // Pet ID 2 ("Rex") has no expenses
    })

    await waitFor(() => {
      expect(
        screen.getByText((text) =>
          text.toLowerCase().includes("no expenses found")
        )
      ).toBeInTheDocument()
    })
  })

  global.fetch = jest.fn(() => Promise.reject(new Error("Fetch failed")))
  it("shows error if fetching pets fails", async () => {
    global.fetch = jest.fn(() => Promise.reject("fail"))

    renderWithRouter(<ExpenseTracker />)
    await waitFor(() => {
      expect(screen.getByText(/failed to load pets/i)).toBeInTheDocument()
    })
  })

  it("resets state when user logs out", async () => {
    jest.mock("firebase/auth", () => ({
      getAuth: () => ({
        currentUser: null,
        onAuthStateChanged: jest.fn((cb) => {
          cb(null) // user logs out
          return () => {}
        })
      })
    }))

    renderWithRouter(<ExpenseTracker />)
    await waitFor(() => {
      expect(screen.getByText("Total Expenses")).toBeInTheDocument() // Still renders, but no expenses
    })
  })

  it("shows error if pets API responds with success: false", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: false,
            error: "Backend error"
          })
      })
    )

    renderWithRouter(<ExpenseTracker />)

    await waitFor(() => {
      expect(screen.getByText(/backend error/i)).toBeInTheDocument()
    })
  })

  it("does not add expense if petId is invalid", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Add Expense"))

    fireEvent.change(screen.getByPlaceholderText("Description *"), {
      target: { value: "Snack" }
    })
    fireEvent.change(screen.getByPlaceholderText("Amount *"), {
      target: { value: "5" }
    })
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "2" } // Pet ID 2
    })

    fireEvent.click(screen.getByText("Save Expense"))

    await waitFor(() => {
      expect(screen.queryByText("Snack")).not.toBeInTheDocument()
    })
  })

  it("does not add expense if date is missing", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Add Expense"))

    fireEvent.change(screen.getByPlaceholderText("Description *"), {
      target: { value: "Vet Visit" }
    })
    fireEvent.change(screen.getByPlaceholderText("Amount *"), {
      target: { value: "60" }
    })
    fireEvent.change(screen.getAllByRole("combobox")[1], {
      target: { value: "1" } // Valid pet ID
    })

    // Don't provide a date
    fireEvent.click(screen.getByText("Save Expense"))

    await waitFor(() => {
      expect(screen.queryByText("Vet Visit")).not.toBeInTheDocument()
    })
  })

  it("does not save edit if category is missing", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Edit"))

    const categorySelect = screen.getAllByRole("combobox")[1]
    fireEvent.change(categorySelect, { target: { value: "" } })

    fireEvent.click(screen.getByText("Save Changes"))

    await waitFor(() => {
      expect(screen.getByText("Save Changes")).toBeInTheDocument()
    })
  })

  it("handles edit with unknown petId gracefully", async () => {
    const expenseWithUnknownPet = {
      ...mockExpenses[0],
      petId: "999" // Not in mockPets
    }
    ExpenseService.getExpenses.mockResolvedValue([expenseWithUnknownPet])

    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Edit"))

    const descInput = screen.getByPlaceholderText("Description *")
    expect(descInput).toHaveValue("Chicken")
  })

  it("closes add expense modal when Cancel is clicked", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Add Expense"))

    const cancelBtn = screen.getByText("Cancel")
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(screen.queryByText("Save Expense")).not.toBeInTheDocument()
    })
  })

  it("does not save edit if amount is invalid", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Edit"))

    const amountInput = screen.getByPlaceholderText("Amount *")
    fireEvent.change(amountInput, { target: { value: "-100" } })

    fireEvent.click(screen.getByText("Save Changes"))

    await waitFor(() => {
      expect(screen.getByText("Save Changes")).toBeInTheDocument()
    })
  })

  it("resets filter when 'All Pets' is selected", async () => {
    renderWithRouter(<ExpenseTracker />)
    await screen.findByText("Chicken")

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "2" } // no expenses
    })

    await waitFor(() => {
      expect(screen.getByText(/no expenses/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "all" } // back to all pets
    })

    await waitFor(() => {
      expect(screen.getByText("Chicken")).toBeInTheDocument()
    })
  })

  it("closes edit modal when Cancel is clicked", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Edit"))

    fireEvent.click(screen.getByText("Cancel"))

    await waitFor(() => {
      expect(screen.queryByText("Save Changes")).not.toBeInTheDocument()
    })
  })

  it("shows empty pet dropdown if user has no pets", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, pets: [] })
      })
    )

    renderWithRouter(<ExpenseTracker />)

    await waitFor(() => {
      expect(screen.getByText("All Pets")).toBeInTheDocument()
    })
    expect(screen.getByText("All Pets").closest("select").children.length).toBe(
      1
    ) // Only 'All Pets'
  })

  it("groups uncategorized expense under 'Others'", async () => {
    const badExpense = { ...mockExpenses[0], category: undefined }
    ExpenseService.getExpenses.mockResolvedValue([badExpense])

    renderWithRouter(<ExpenseTracker />)

    await waitFor(() => {
      expect(screen.getByText(/Others/)).toBeInTheDocument()
    })
  })

  it("shows alert when add expense API fails", async () => {
    window.alert = jest.fn()
    ExpenseService.createExpense.mockRejectedValue(new Error("Add failed"))

    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Add Expense"))

    fireEvent.change(screen.getByPlaceholderText("Description *"), {
      target: { value: "Treats" }
    })
    fireEvent.change(screen.getByPlaceholderText("Amount *"), {
      target: { value: "10" }
    })

    fireEvent.click(screen.getByText("Save Expense"))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to add expense")
    })
  })

  it("shows alert when edit expense API fails", async () => {
    window.alert = jest.fn()
    ExpenseService.updateExpense.mockRejectedValue(new Error("Update failed"))

    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Edit"))

    fireEvent.click(screen.getByText("Save Changes"))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to update expense")
    })
  })

  it("only shows 3 most recent expenses", async () => {
    const manyExpenses = [
      { ...mockExpenses[0], id: 1, date: "2024-07-01" },
      { ...mockExpenses[0], id: 2, date: "2024-07-02" },
      { ...mockExpenses[0], id: 3, date: "2024-07-03" },
      { ...mockExpenses[0], id: 4, date: "2024-07-04" }
    ]
    ExpenseService.getExpenses.mockResolvedValue(manyExpenses)

    renderWithRouter(<ExpenseTracker />)

    await waitFor(() => {
      const rows = screen.getAllByRole("row").slice(1) // skip header row
      expect(rows.length).toBe(3)
    })
  })

  it("handles expenses with invalid date format gracefully", async () => {
    const badDateExpense = { ...mockExpenses[0], date: "invalid-date", id: 999 }
    ExpenseService.getExpenses.mockResolvedValue([badDateExpense])
  
    renderWithRouter(<ExpenseTracker />)
  
    await waitFor(() => {
      expect(screen.getByText("Invalid Date")).toBeInTheDocument()
    })
  })  
  
  it("shows error if expense fetch fails", async () => {
    ExpenseService.getExpenses.mockRejectedValue(new Error("Fetch failed"))
  
    renderWithRouter(<ExpenseTracker />)
  
    await waitFor(() => {
      expect(screen.getByText(/Failed to load expenses/i)).toBeInTheDocument()
    })
  })
  
  it("renders all categories with $0.00 when there are no expenses", async () => {
    ExpenseService.getExpenses.mockResolvedValue([])
  
    renderWithRouter(<ExpenseTracker />)
  
    await waitFor(() => {
      // Look for multiple category amounts
      const zeroAmounts = screen.getAllByText((content) =>
        content.includes("SGD $0.00") || content.includes("$0.00")
      )
      expect(zeroAmounts.length).toBeGreaterThanOrEqual(8)
    })
  })  
  
  it("does not add expense if no pet is selected", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Add Expense"))
  
    // Clear the pet ID
    fireEvent.change(screen.getByPlaceholderText("Description *"), {
      target: { value: "Snack" }
    })
    fireEvent.change(screen.getByPlaceholderText("Amount *"), {
      target: { value: "10" }
    })
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "" } // no pet selected
    })
  
    fireEvent.click(screen.getByText("Save Expense"))
  
    await waitFor(() => {
      expect(screen.queryByText("Snack")).not.toBeInTheDocument()
    })
  })
  
  it("does not save edit if selected pet is invalid", async () => {
    renderWithRouter(<ExpenseTracker />)
    fireEvent.click(await screen.findByText("Edit"))
  
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "999" } // pet not in list
    })
  
    fireEvent.click(screen.getByText("Save Changes"))
  
    await waitFor(() => {
      expect(screen.getByText("Save Changes")).toBeInTheDocument()
    })
  })

  it("skips fetching expenses when no current user", async () => {
    const originalGetAuth = getAuth;
  
    // Spy and override currentUser to null
    jest.spyOn(require("firebase/auth"), "getAuth").mockReturnValue({
      ...originalGetAuth(),
      currentUser: null,
      onAuthStateChanged: (cb) => {
        cb(null); // simulate logout
        return () => {};
      }
    });
  
    renderWithRouter(<ExpenseTracker />);
  
    await waitFor(() => {
      // Should render but not call getExpenses
      expect(ExpenseService.getExpenses).not.toHaveBeenCalled();
    });
  });
  
})