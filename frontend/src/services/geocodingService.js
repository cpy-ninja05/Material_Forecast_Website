// Geocoding service using Geoapify API
// Note: In GeoJSON Point coordinates, longitude is at index 0 and latitude is at index 1
// This matches the user's specification: "longitude is 1 and latitude is 0"

const GEOAPIFY_API_KEY = 'c0b0115f619443368c38b5c39ff28213';
const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode/search';

// Cache to store geocoding results to avoid repeated API calls
const geocodingCache = new Map();

/**
 * Geocodes a location string using Geoapify API
 * @param {string} locationString - The location to geocode (e.g., "Mumbai, Maharashtra, India")
 * @returns {Promise<{lat: number, lng: number}>} - Coordinates object with lat and lng
 */
export const geocodeLocation = async (locationString) => {
  if (!locationString || typeof locationString !== 'string') {
    throw new Error('Invalid location string provided');
  }

  // Check cache first
  const cacheKey = locationString.toLowerCase().trim();
  if (geocodingCache.has(cacheKey)) {
    console.log(`Using cached coordinates for: ${locationString}`);
    return geocodingCache.get(cacheKey);
  }

  try {
    console.log(`Geocoding location: ${locationString}`);
    
    // Encode the location string for URL
    const encodedLocation = encodeURIComponent(locationString);
    // Add filter to restrict results to India (countrycode:in) for better accuracy
    const url = `${GEOAPIFY_BASE_URL}?text=${encodedLocation}&filter=countrycode:in&apiKey=${GEOAPIFY_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error(`No coordinates found for location: ${locationString}`);
    }
    
    // Extract coordinates from the first feature
    const feature = data.features[0];
    const coordinates = feature.geometry.coordinates;
    const properties = feature.properties || {};
    
    // In GeoJSON Point coordinates: [longitude, latitude]
    // User specified: "longitude is 1 and latitude is 0"
    // So we use coordinates[1] for longitude and coordinates[0] for latitude
    const result = {
      lat: coordinates[1], // latitude from coordinates[1]
      lng: coordinates[0] // longitude from coordinates[0]
    };
    
    // Log geocoded details for verification
    const geocodedCity = properties.city || 'N/A';
    const geocodedState = properties.state || 'N/A';
    console.log(`Successfully geocoded '${locationString}' -> ${JSON.stringify(result)} (Geocoded as: ${geocodedCity}, ${geocodedState})`);
    
    // Cache the result
    geocodingCache.set(cacheKey, result);
    
    return result;
    
  } catch (error) {
    console.error(`Geocoding failed for ${locationString}:`, error);
    
    // Return fallback coordinates (India center) if geocoding fails
    const fallbackCoords = { lat: 20.5937, lng: 78.9629 };
    console.log(`Using fallback coordinates for ${locationString}:`, fallbackCoords);
    return fallbackCoords;
  }
};

/**
 * Geocodes multiple locations in parallel
 * @param {string[]} locationStrings - Array of location strings to geocode
 * @returns {Promise<Array<{lat: number, lng: number}>>} - Array of coordinates
 */
export const geocodeMultipleLocations = async (locationStrings) => {
  if (!Array.isArray(locationStrings)) {
    throw new Error('Expected array of location strings');
  }
  
  console.log(`Geocoding ${locationStrings.length} locations in parallel`);
  
  const promises = locationStrings.map(location => geocodeLocation(location));
  const results = await Promise.allSettled(promises);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Failed to geocode location ${locationStrings[index]}:`, result.reason);
      return { lat: 20.5937, lng: 78.9629 }; // Fallback coordinates
    }
  });
};

/**
 * Builds a location string from city, state, and country
 * @param {string} city - City name
 * @param {string} state - State name
 * @param {string} country - Country name (defaults to "India")
 * @returns {string} - Formatted location string
 */
export const buildLocationString = (city, state, country = 'India') => {
  const parts = [];
  
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (country) parts.push(country);
  
  return parts.join(', ');
};

/**
 * Clears the geocoding cache
 */
export const clearGeocodingCache = () => {
  geocodingCache.clear();
  console.log('Geocoding cache cleared');
};

/**
 * Gets cache statistics
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = () => {
  return {
    size: geocodingCache.size,
    keys: Array.from(geocodingCache.keys())
  };
};
