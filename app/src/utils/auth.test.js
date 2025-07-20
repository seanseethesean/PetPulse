import AuthService from "./auth";

describe("AuthService", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("signup", () => {
    it("successfully signs up user", async () => {
      const mockResponse = { message: "User created" };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AuthService.signup("test@example.com", "password123");
      expect(result).toEqual(mockResponse);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toMatch(/\/api\/auth\/signup$/);
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(options.body)).toEqual({
        email: "test@example.com",
        password: "password123"
      });
    });

    it("throws default signup error if message is missing", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      await expect(AuthService.signup("a@b.com", "123")).rejects.toThrow("Signup failed");
    });

    it("throws if response.json fails in signup", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error("Malformed JSON");
        }
      });

      await expect(AuthService.signup("a@b.com", "123")).rejects.toThrow("Malformed JSON");
    });

    it("throws error if fetch fails during signup", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        AuthService.signup("test@example.com", "pass123")
      ).rejects.toThrow("Network error");
    });
  });

  describe("login", () => {
    it("successfully logs in user", async () => {
      const mockResponse = { token: "abc123" };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AuthService.login("test@example.com", "password123");
      expect(result).toEqual(mockResponse);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toMatch(/\/api\/auth\/login$/);
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(options.body)).toEqual({
        email: "test@example.com",
        password: "password123"
      });
    });

    it("throws default login error if message is missing", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      await expect(AuthService.login("a@b.com", "123")).rejects.toThrow("Login failed");
    });

    it("throws if login response is not JSON", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error("Bad JSON");
        }
      });

      await expect(AuthService.login("email", "pass")).rejects.toThrow("Bad JSON");
    });
  });

  describe("verifyGoogleToken", () => {
    it("successfully verifies Google token", async () => {
      const mockResponse = { userId: "google-user-1" };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AuthService.verifyGoogleToken("fake-id-token");
      expect(result).toEqual(mockResponse);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toMatch(/\/api\/auth\/google$/);
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(options.body)).toEqual({ idToken: "fake-id-token" });
    });

    it("throws default google sign-in error if message is missing", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      await expect(AuthService.verifyGoogleToken("bad")).rejects.toThrow(
        "Google sign-in failed"
      );
    });

    it("throws if google token json fails", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error("Failed to parse JSON");
        }
      });

      await expect(AuthService.verifyGoogleToken("bad")).rejects.toThrow(
        "Failed to parse JSON"
      );
    });
  });
});