import NearbyService from "./nearby";

const mockResponse = {
  results: [
    {
      displayName: { text: "Mock Pet Shop" },
      formattedAddress: "123 Mock Street",
      type: "PET_STORE",
      location: {
        latitude: 1.23,
        longitude: 103.45,
      },
    },
  ],
};

describe("NearbyService", () => {
  const lat = 1.3521;
  const lon = 103.8198;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch nearby services successfully", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await NearbyService.getNearbyServices(lat, lon);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/nearby"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      }
    );

    expect(result).toEqual(mockResponse.results);
  });

  it("should handle API error with custom message", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Bad Request" }),
    });

    await expect(NearbyService.getNearbyServices(lat, lon)).rejects.toThrow(
      "Bad Request"
    );
  });

  it("should handle API error with default message", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await expect(NearbyService.getNearbyServices(lat, lon)).rejects.toThrow(
      "Failed to fetch nearby services"
    );
  });

  it("should handle network or JSON parsing error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network Error"));

    await expect(NearbyService.getNearbyServices(lat, lon)).rejects.toThrow(
      "Network Error"
    );
  });
});