import React, { useEffect, useState } from "react";
import NearbyService from "../utils/nearby";
import Navbar from "../components/Navbar";
import "../assets/NearbyServices.css"; 

const NearbyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await NearbyService.getNearbyServices(latitude, longitude);
          setServices(data);
        } catch (err) {
          setError(err.message || "Failed to load nearby services");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Location permission denied.");
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="nearby-container">
      <h2>Nearby Pet Services</h2>
      <Navbar />  
      {loading && <p>Loading nearby services...</p>}
      {error && <p className="error">{error}</p>}
      <div className="services-grid">
        {services.map((place, index) => (
          <div className="service-card" key={index}>
            <h3>{place.displayName?.text || "Unnamed Place"}</h3>
            <p>{place.formattedAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyServices;