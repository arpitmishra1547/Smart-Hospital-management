import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance * 1000; // Convert to meters
}

// Generate unique token number
export function generateTokenNumber(hospitalName, department, sequence) {
  const hospitalPrefix = hospitalName.substring(0, 3).toUpperCase();
  const deptPrefix = department.substring(0, 3).toUpperCase();
  const sequenceStr = String(sequence).padStart(3, '0');
  return `${hospitalPrefix}-${deptPrefix}-${sequenceStr}`;
}

// Format date to YYYY-MM-DD
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Validate coordinates
export function isValidCoordinates(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
