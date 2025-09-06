// Configuration file for the hospital management system
export const config = {
  // Google Maps API Configuration
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'], // 'geocoding' is handled through Geocoder service
    defaultCenter: { lat: 23.251797808801957, lng: 77.46620424743277 }, // Center of India
    defaultZoom: 15,
    enabled: true // Enable for geocoding functionality
  },

  // Token Generation Settings
  token: {
    radiusMeters: 100,
    checkIntervalMs: 10000, // 10 seconds
    format: 'HOSPITAL-DEPARTMENT-SEQUENCE'
  },

  // Hospital Settings
  hospital: {
    defaultCity: 'India',
    supportedDepartments: [
      'Cardiology',
      'Dermatology', 
      'Orthopedics',
      'General Medicine',
      'Pediatrics',
      'Neurology',
      'Gynecology',
      'Psychiatry'
    ]
  },

  // Patient Settings
  patient: {
    aadhaarLength: 12,
    mobileLength: 10,
    minAge: 0,
    maxAge: 120
  },

  // API Endpoints
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    endpoints: {
      patientRegistration: '/api/patients/register',
      tokenGeneration: '/api/patients/generate-token',
      patientProfile: '/api/patients'
    }
  }
};

// Helper function to get Google Maps script URL
export function getGoogleMapsScriptUrl() {
  const { apiKey, libraries } = config.googleMaps;
  const libs = libraries.join(',');
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libs}&callback=initMap&v=weekly`;
}

// Helper function to validate configuration
export function validateConfig() {
  const errors = [];
  
  if (!config.googleMaps.apiKey || config.googleMaps.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    errors.push('Google Maps API key is not configured');
  }
  
  if (config.token.radiusMeters <= 0) {
    errors.push('Token radius must be greater than 0');
  }
  
  return errors;
}
