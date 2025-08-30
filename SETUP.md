# Smart Hospital Management System - Setup Guide

## 🏥 Overview

This is a comprehensive hospital management system with the following key features:

- **Patient Registration**: Complete patient registration with Aadhaar verification
- **Google Maps Integration**: Hospital location geocoding and mapping
- **Location-Based Token System**: Automatic token generation when patients are within 100m of hospital
- **Real-time Location Tracking**: Continuous monitoring of patient location
- **MongoDB Database**: Secure storage of patient and hospital data

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Google Maps API key

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd my-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### 3. Environment Configuration

Create a `.env.local` file in your project root:

```env
# Google Maps API Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Application Configuration
NEXT_PUBLIC_APP_NAME=Smart Hospital Management System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the API key to your `.env.local` file

### 5. MongoDB Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Add it to your `.env.local` file

### 6. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build
npm start
```

## 🏗️ System Architecture

### Frontend Components

- **Patient Registration** (`/patient/register`): Complete registration form with Aadhaar verification
- **Patient Dashboard** (`/patient/dashboard`): Main dashboard with location tracking
- **Location Tracker**: Real-time location monitoring and token generation

### Backend API Endpoints

- **POST** `/api/patients/register`: Patient registration
- **POST** `/api/patients/generate-token`: Location-based token generation
- **POST** `/api/patients`: Patient profile management

### Database Collections

- `patients_profile`: Main patient information
- `patients_mobileNumbers`: Mobile number lookup
- `patients_aadhaar`: Aadhaar number lookup
- `hospital_locations`: Hospital coordinates and details
- `tokens`: Generated tokens with metadata

## 🔧 Key Features Implementation

### 1. Patient Registration Flow

1. User fills out registration form
2. Aadhaar verification via OTP
3. Hospital location geocoding
4. Data validation and storage
5. Success confirmation

### 2. Location-Based Token Generation

1. Patient enables location tracking
2. System monitors distance to hospital
3. When within 100m, token is automatically generated
4. Token includes unique number and metadata
5. Real-time notifications

### 3. Haversine Formula

The system uses the Haversine formula to calculate accurate distances between coordinates:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Distance in meters
}
```

## 🎯 Usage Instructions

### For Patients

1. **Registration**:
   - Visit `/patient/register`
   - Fill out all required fields
   - Verify Aadhaar with OTP
   - Enter hospital details and geocode location
   - Complete registration

2. **Token Generation**:
   - Go to dashboard
   - Enable location tracking
   - Travel to hospital location
   - Token generates automatically when within 100m

### For Administrators

1. **Monitor Registrations**: Check `/api/patients` endpoint
2. **View Tokens**: Monitor `/api/patients/generate-token` activity
3. **Database Management**: Use MongoDB Atlas dashboard

## 🔒 Security Features

- Environment variable configuration
- API key restrictions
- Input validation and sanitization
- Secure MongoDB connections
- HTTPS enforcement in production

## 🧪 Testing

### Manual Testing

1. **Registration Flow**:
   - Test with valid/invalid data
   - Verify Aadhaar OTP flow
   - Test hospital geocoding

2. **Location Tracking**:
   - Test location permissions
   - Verify distance calculations
   - Test token generation

3. **API Endpoints**:
   - Test all endpoints with Postman/Insomnia
   - Verify error handling
   - Check response formats

### Automated Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚨 Troubleshooting

### Common Issues

1. **Google Maps not loading**:
   - Check API key configuration
   - Verify API is enabled
   - Check domain restrictions

2. **MongoDB connection failed**:
   - Verify connection string
   - Check network access
   - Verify user permissions

3. **Location tracking not working**:
   - Check browser permissions
   - Verify HTTPS (required for geolocation)
   - Test on mobile device

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
DEBUG=hospital-system:*
```

## 📱 Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly interface
- GPS integration for accurate location
- Offline capability for basic functions

## 🔄 Future Enhancements

- [ ] Push notifications
- [ ] QR code token generation
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with hospital systems
- [ ] Emergency contact management

## 📞 Support

For technical support or questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This is a demonstration system. For production use, ensure proper security measures, data encryption, and compliance with healthcare regulations.
