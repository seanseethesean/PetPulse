import TaskService from "./tasks";

const mockUrl = "https://mockapi.com";
process.env.REACT_APP_API_URL = mockUrl;

describe("TaskService", () => {
  const mockTask = {
    id: "123",
    title: "Feed Buddy",
    date: "2025-07-22",
    userId: "test-user",
    completed: false
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("formatDateForAPI formats correctly", () => {
    const date = new Date("2025-07-22T12:00:00Z");
    expect(TaskService.formatDateForAPI(date)).toBe("2025-07-22");
  });

  test("handleResponse returns JSON on success", async () => {
    const response = {
      ok: true,
      json: async () => ({ success: true })
    };
    const result = await TaskService.handleResponse(response);
    expect(result).toEqual({ success: true });
  });

  test("handleResponse throws error with message", async () => {
    const response = {
      ok: false,
      json: async () => ({ error: "Invalid" })
    };
    await expect(TaskService.handleResponse(response)).rejects.toThrow("Invalid");
  });

  test("handleResponse throws default error when JSON fails", async () => {
    const response = {
      ok: false,
      json: async () => {
        throw new Error("Parse error");
      }
    };
    await expect(TaskService.handleResponse(response)).rejects.toThrow("Network error");
  });

  test("getTasksByDate throws error on failure", async () => {
    fetch.mockRejectedValueOnce(new Error("Fetch failed"));
    await expect(TaskService.getTasksByDate(new Date(), "u1")).rejects.toThrow("Fetch failed");
  });

  test("createTask sends POST request", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "123" })
    });
    const result = await TaskService.createTask(mockTask);
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/tasks`, expect.objectContaining({
      method: "POST",
      headers: expect.any(Object),
      body: JSON.stringify(mockTask)
    }));
    expect(result).toEqual({ id: "123" });
  });

  test("updateTask sends PUT request", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ updated: true })
    });
    const result = await TaskService.updateTask("123", { title: "New Title" });
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/tasks/123`, expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ title: "New Title" })
    }));
    expect(result).toEqual({ updated: true });
  });

  test("toggleTaskCompletion sends PATCH request", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    const result = await TaskService.toggleTaskCompletion("123", true);
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/tasks/123/toggle`, expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ completed: true })
    }));
    expect(result).toEqual({ success: true });
  });

  test("deleteTask sends DELETE request", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ deleted: true })
    });
    const result = await TaskService.deleteTask("123");
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/tasks/123`, { method: "DELETE" });
    expect(result).toEqual({ deleted: true });
  });

  test("deleteTask throws error on failure", async () => {
    fetch.mockRejectedValueOnce(new Error("Delete failed"));
    await expect(TaskService.deleteTask("bad-id")).rejects.toThrow("Delete failed");
  });

  test("updateTask throws and logs error on failure", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error("Update failed"));
  
    await expect(TaskService.updateTask("123", { title: "Fail" })).rejects.toThrow("Update failed");
  
    expect(consoleSpy).toHaveBeenCalledWith("Error updating task:", expect.any(Error));
    consoleSpy.mockRestore();
  });
  
  test("toggleTaskCompletion throws and logs error on failure", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error("Toggle failed"));
  
    await expect(TaskService.toggleTaskCompletion("123", true)).rejects.toThrow("Toggle failed");
  
    expect(consoleSpy).toHaveBeenCalledWith("Error toggling task:", expect.any(Error));
    consoleSpy.mockRestore();
  });
  
});