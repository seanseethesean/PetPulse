export async function fetchNearbyPlaces(lat, lon) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = "https://places.googleapis.com/v1/places:searchNearby";
  
    const body = {
      includedTypes: ["pet_store", "veterinary_care"],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lon },
          radius: 5000,
        },
      },
    };
  
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify(body),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error?.message || "Google Places API error");
    }
  
    return data.places || [];
  }  