import { fetchNearbyPlaces } from '../services/nearby.service.js';

global.fetch = jest.fn();

describe('fetchNearbyPlaces', () => {
  const lat = 1.3521;
  const lon = 103.8198;

  const mockApiKey = 'fake-key';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_MAPS_API_KEY = mockApiKey;
  });

  it('fetches and returns nearby veterinary and pet store places', async () => {
    const mockVetResponse = {
      places: [
        {
          displayName: { text: 'Vet A' },
          formattedAddress: '123 Animal Rd',
          location: { latitude: lat, longitude: lon },
        }
      ]
    };

    const mockPetStoreResponse = {
      places: [
        {
          displayName: { text: 'Pet Shop B' },
          formattedAddress: '456 Pet St',
          location: { latitude: lat, longitude: lon },
        }
      ]
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockVetResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPetStoreResponse,
      });

    const result = await fetchNearbyPlaces(lat, lon);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { ...mockVetResponse.places[0], type: 'veterinary_care' },
      { ...mockPetStoreResponse.places[0], type: 'pet_store' }
    ]);
  });

  it('throws error if fetch returns not ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Invalid API Key' } }),
    });

    await expect(fetchNearbyPlaces(lat, lon)).rejects.toThrow('Invalid API Key');
  });

  it('returns empty array if no places found', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const result = await fetchNearbyPlaces(lat, lon);
    expect(result).toEqual([]);
  });
});