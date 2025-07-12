const URL = process.env.REACT_APP_API_URL

class NearbyService {
  static async getNearbyServices(lat, lon) {
    try {
      const res = await fetch(`${URL}/api/nearby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch nearby services")
      }

      return data.results || []
    } catch (err) {
      console.error("NearbyService error:", err)
      throw err
    }
  }
}

export default NearbyService