import PetService from './pet';

const mockUrl = 'https://mockapi.com';
process.env.REACT_APP_API_URL = mockUrl;

describe('PetService', () => {
  const mockPet = { petName: 'Buddy', animalType: 'Dog', breed: 'Labrador', birthday: '2020-01-01' };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('getPets - success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, pets: [mockPet] })
    });

    const result = await PetService.getPets('123');
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/pets?userId=123`);
    expect(result.pets[0].petName).toBe('Buddy');
  });

  test('createPet - success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const result = await PetService.createPet(mockPet);
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/pets`, expect.objectContaining({
      method: 'POST'
    }));
    expect(result.success).toBe(true);
  });

  test('updatePet - success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const result = await PetService.updatePet('1', mockPet);
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/pets/1`, expect.objectContaining({
      method: 'PUT'
    }));
    expect(result.success).toBe(true);
  });

  test('deletePet - success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const result = await PetService.deletePet('1');
    expect(fetch).toHaveBeenCalledWith(`${mockUrl}/api/pets/1`, expect.objectContaining({
      method: 'DELETE'
    }));
    expect(result.success).toBe(true);
  });

  test('handleResponse - !ok with valid JSON error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Pet not found' })
    });

    await expect(PetService.getPets('999')).rejects.toThrow('Pet not found');
  });

  test('handleResponse - !ok with invalid JSON error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error('invalid json'))
    });

    await expect(PetService.getPets('999')).rejects.toThrow('Network error');
  });
});