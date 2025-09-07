# Overview

This is a Smart Hospital Management System built as a modern, full-stack web application using Next.js, MongoDB, and Firebase authentication. The system provides comprehensive management capabilities for patients, doctors, and hospital authorities with features including mobile-based OTP authentication, location-based token generation, real-time patient tracking, and hospital management tools.

The application serves three main user types: patients who can register and track their hospital visits, doctors who can manage patient consultations and prescriptions, and hospital authorities who can oversee operations, manage staff, and monitor analytics.

**Note**: This project is configured to run both in Replit and locally. See `LOCAL_SETUP.md` for local development instructions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 15 with React 19 for server-side rendering and optimal performance
- **Styling**: Tailwind CSS with custom design system featuring hospital-themed emerald green color palette
- **UI Components**: Custom component library built on Radix UI primitives for accessibility
- **Animations**: Framer Motion for smooth transitions and interactive elements
- **State Management**: React hooks for local state, localStorage for session persistence

## Backend Architecture
- **API Layer**: Next.js API Routes providing RESTful endpoints
- **Authentication**: Firebase Phone Authentication with OTP verification
- **Session Management**: localStorage-based session storage for user data
- **Database Access**: Direct MongoDB connection using official MongoDB driver
- **Data Validation**: Server-side validation for all API endpoints

## Database Design
- **Primary Database**: MongoDB Atlas with three main collections:
  - `patients_profile`: Complete patient information including medical history
  - `patients_mobileNumbers`: Mobile number registry for quick authentication lookups
  - `doctors_list`: Doctor profiles with specializations and department assignments
  - `departments`: Hospital department management
  - `opd_rooms`: OPD room assignments and scheduling
  - `tokens`: Patient token system for queue management
  - `prescriptions`: Medical prescriptions and treatment history
  - `schedules`: Doctor and room scheduling system

## Location Services
- **Geolocation**: Browser-based location tracking for patients
- **Distance Calculation**: Haversine formula implementation for proximity detection
- **Token Generation**: Automatic token creation when patients are within 100m of hospital
- **Hospital Mapping**: Integration with location data for hospital discovery

## Security Features
- **Phone Authentication**: Firebase-based OTP verification system
- **Data Validation**: Input sanitization and validation on all endpoints
- **Secure Sessions**: Token-based authentication for different user roles
- **Database Security**: MongoDB connection with SSL/TLS encryption

# External Dependencies

## Google Services
- **Google Maps API**: Hospital location services, geocoding, and place search functionality
- **Places API**: Hospital discovery and location-based services

## Firebase Services
- **Firebase Authentication**: Phone number verification and OTP management
- **Firebase SDK**: Client-side authentication handling

## Database Services
- **MongoDB Atlas**: Cloud-hosted MongoDB instance with global distribution
- **MongoDB Driver**: Official Node.js driver for database operations

## UI and Design Libraries
- **Radix UI**: Accessible UI component primitives
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Data visualization and analytics charts
- **Framer Motion**: Animation and interaction library

## Development Dependencies
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **ESLint**: Code linting and style enforcement
- **Geist Font**: Modern font family for professional appearance

## Runtime Environment
- **Node.js 18+**: Server runtime environment
- **Next.js**: Full-stack React framework with API routes
- **Vercel Platform**: Deployment and hosting (implied by Next.js setup)