// Google Maps API Configuration
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Validate API key
if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key not found in environment variables. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.');
}
