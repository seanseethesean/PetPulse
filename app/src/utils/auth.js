const URL = process.env.REACT_APP_API_URL;

class AuthService {
  async signup(email, password) {
    const res = await fetch(`${URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
    return data;
  }

  async login(email, password) {
    const res = await fetch(`${URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  }

  async verifyGoogleToken(idToken) {
    const res = await fetch(`${URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google sign-in failed');
    return data;
  }
}

export default new AuthService();