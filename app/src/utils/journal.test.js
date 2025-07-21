import JournalService from "./journal";

describe("JournalService", () => {
  const mockURL = "https://mockapi.com";

  beforeEach(() => {
    process.env.REACT_APP_API_URL = mockURL;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockEntry = {
    id: "123",
    userId: "user1",
    petName: "Buddy",
    title: "Morning Walk",
    content: "Went for a walk",
    mood: "happy",
    activities: ["Walk"],
    date: "2025-07-21"
  };

  it("formats date for API", () => {
    const date = new Date("2025-07-21T15:00:00.000Z");
    const formatted = JournalService.formatDateForAPI(date);
    expect(formatted).toBe("2025-07-21");
  });

  it("fetches journal entries successfully", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockEntry]
    });

    const result = await JournalService.getEntries("user1", "Buddy");
    expect(fetch).toHaveBeenCalledWith(`${mockURL}/api/journal?userId=user1&petName=Buddy`);
    expect(result).toEqual([mockEntry]);
  });

  it("creates a journal entry", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntry
    });

    const result = await JournalService.createEntry(mockEntry);
    expect(fetch).toHaveBeenCalledWith(`${mockURL}/api/journal`, expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockEntry)
    }));
    expect(result).toEqual(mockEntry);
  });

  it("updates a journal entry", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Updated" })
    });

    const result = await JournalService.updateEntry("123", mockEntry);
    expect(fetch).toHaveBeenCalledWith(`${mockURL}/api/journal/123`, expect.objectContaining({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockEntry)
    }));
    expect(result).toEqual({ message: "Updated" });
  });

  it("deletes a journal entry", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Deleted" })
    });

    const result = await JournalService.deleteEntry("123");
    expect(fetch).toHaveBeenCalledWith(`${mockURL}/api/journal/123`, expect.objectContaining({
      method: "DELETE"
    }));
    expect(result).toEqual({ message: "Deleted" });
  });

  it("handles network error gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(JournalService.getEntries("user1", "Buddy")).rejects.toThrow("Network error");
  });

  it("throws proper error on failed response", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid data" })
    });

    await expect(JournalService.createEntry(mockEntry)).rejects.toThrow("Invalid data");
  });

  it("throws generic error on malformed error response", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new Error("bad json") }
    });

    await expect(JournalService.deleteEntry("123")).rejects.toThrow("Network error");
  });
});