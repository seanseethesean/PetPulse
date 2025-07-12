export async function fetchNearbyPlaces(lat, lon) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = "https://places.googleapis.com/v1/places:searchNearby";

  const types = ["veterinary_care", "pet_store"];
  const allPlaces = [];

  for (const type of types) {
    const body = {
      includedTypes: [type],
      maxResultCount: 3,
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

    if (data.places) {
      // Tag each place with its type (optional, helps with UI filtering)
      const tagged = data.places.map((place) => ({ ...place, type }));
      allPlaces.push(...tagged);
    }
  }

  return allPlaces; // total should be up to 9 places
}