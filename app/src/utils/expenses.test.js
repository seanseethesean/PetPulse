import ExpenseService from "./expenses"

const mockExpense = {
  userId: "testUser",
  petId: "pet123",
  amount: 50,
  category: "Food",
  date: "2025-07-20",
  description: "Dog food"
}

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe("ExpenseService", () => {
  describe("getExpenses", () => {
    it("fetches all expenses for user", async () => {
      const mockResponse = [{ ...mockExpense, id: "1" }]
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await ExpenseService.getExpenses("testUser")
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/expenses?userId=testUser")
      )
      expect(result).toEqual(mockResponse)
    })

    it("handles API failure", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to fetch expenses" })
      })

      await expect(ExpenseService.getExpenses("testUser")).rejects.toThrow(
        "Failed to fetch expenses"
      )
    })
  })

  describe("getExpensesByDateRange", () => {
    it("fetches expenses within date range", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ["mocked"]
      })

      const result = await ExpenseService.getExpensesByDateRange(
        "testUser",
        "2025-07-01",
        "2025-07-20"
      )
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/expenses/date-range?userId=testUser&startDate=2025-07-01&endDate=2025-07-20"
        )
      )
      expect(result).toEqual(["mocked"])
    })
  })

  describe("createExpense", () => {
    it("creates an expense", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "123", ...mockExpense })
      })

      const result = await ExpenseService.createExpense(mockExpense)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/expenses"),
        expect.any(Object)
      )
      expect(result.id).toBe("123")
    })
  })

  describe("updateExpense", () => {
    it("updates an expense", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const result = await ExpenseService.updateExpense("exp123", {
        amount: 60
      })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/expenses/exp123"),
        expect.any(Object)
      )
      expect(result.success).toBe(true)
    })
  })

  describe("deleteExpense", () => {
    it("deletes an expense", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deleted: true })
      })

      const result = await ExpenseService.deleteExpense("exp123")
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/expenses/exp123"),
        { method: "DELETE" }
      )
      expect(result.deleted).toBe(true)
    })
  })

  it("handles response error when response.json() fails", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error("Invalid JSON")
      }
    })

    await expect(ExpenseService.getExpenses("testUser")).rejects.toThrow(
      "Network error"
    )
  })

  it("formats date correctly with formatDateForAPI", () => {
    const date = new Date("2025-07-20T15:30:00Z")
    const formatted = ExpenseService.formatDateForAPI(date)
    expect(formatted).toBe("2025-07-20")
  })

  it("handles error in getExpensesByDateRange", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Date range fetch failed" })
    })

    await expect(
      ExpenseService.getExpensesByDateRange(
        "testUser",
        "2025-07-01",
        "2025-07-20"
      )
    ).rejects.toThrow("Date range fetch failed")
  })

  it("handles error in createExpense", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Create failed" })
    })

    await expect(ExpenseService.createExpense(mockExpense)).rejects.toThrow(
      "Create failed"
    )
  })

  it("handles error in updateExpense", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Update failed" })
    })

    await expect(
      ExpenseService.updateExpense("exp123", { amount: 60 })
    ).rejects.toThrow("Update failed")
  })

  it("handles error in deleteExpense", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Delete failed" })
    })

    await expect(ExpenseService.deleteExpense("exp123")).rejects.toThrow(
      "Delete failed"
    )
  })
})