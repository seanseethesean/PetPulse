import React, { useEffect, useState, useRef } from "react";
import NearbyService from "../utils/nearby";
import "../assets/NearbyServices.css";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const NearbyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        try {
          const data = await NearbyService.getNearbyServices(
            latitude,
            longitude
          );
          setServices(data);
        } catch (err) {
          setError(err.message || "Failed to load nearby services");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location permission denied. Try entering your address.");
        setLoading(false);
      }
    );
  }, []);

  const focusOnPlace = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
  };

  return (
    <div className="nearby-container">
      <h1>Nearby Pet Services</h1>

      {loading && <p>Loading nearby services...</p>}
      {error && <p className="error">{error}</p>}

      {isLoaded && location && (
        <div className="map-container">
          <GoogleMap mapContainerStyle={containerStyle}
            center={location}
            zoom={14}
            onLoad={(map) => (mapRef.current = map)}
          >
            <Marker position={location}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />

            {services.map((place, idx) => (
              place.location && (
                <Marker
                  key={idx}
                  position={{
                    lat: place.location.latitude,
                    lng: place.location.longitude,
                  }}
                />
              )
            ))}
          </GoogleMap>

        </div>
      )}

      <div className="services-section">
        <h2 className="service-group-header">Veterinary Care</h2>
        <div className="services-grid">
          {services
            .filter((place) => place.type?.includes("veterinary"))
            .map((place, index) => (
              <div className="service-card"
                key={`vet-${index}`}
                onClick={() =>
                  focusOnPlace(place.location.latitude, place.location.longitude)
                }
              >
                <h3>{place.displayName?.text || "Unnamed Place"}</h3>
                <p>{place.formattedAddress}</p>
              </div>
            ))}
        </div>

        <h2 className="service-group-header">Pet Store</h2>
        <div className="services-grid">
          {services
            .filter((place) => place.type?.includes("store"))
            .map((place, index) => (
              <div className="service-card"
                key={`store-${index}`}
                onClick={() =>
                  focusOnPlace(place.location.latitude, place.location.longitude)
                }
              >
                <h3>{place.displayName?.text || "Unnamed Place"}</h3>
                <p>{place.formattedAddress}</p>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default NearbyServices;