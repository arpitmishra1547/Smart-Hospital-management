# Local Development Setup

## Prerequisites

- Node.js 18+ installed on your machine
- MongoDB installed locally OR MongoDB Atlas account
- Firebase project set up
- Git installed

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd smart-hospital-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your actual values
```

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Install and start MongoDB locally
# On macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Update .env.local:
MONGODB_URI=mongodb://localhost:27017/hospital-management
```

#### Option B: MongoDB Atlas
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster and get connection string
3. Update .env.local with your Atlas connection string

### 5. Firebase Setup
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable Phone Authentication
4. Get your Firebase config values
5. Update .env.local with your Firebase credentials

### 6. Google Maps Setup (Optional)
1. Go to https://console.cloud.google.com/
2. Create/select a project
3. Enable Maps JavaScript API and Places API
4. Create an API key
5. Update .env.local with your API key

### 7. Run the Application
```bash
# Development mode
npm run dev

# The app will be available at http://localhost:3000
```

### 8. Build for Production
```bash
npm run build
npm start
```

## Key Features

- **Patient Registration**: Complete patient onboarding with hospital selection
- **Token Management**: Location-based token generation with Test Hospital support
- **QR Code Scanner**: Alternative token generation method
- **Doctor Dashboard**: Patient lookup and prescription management
- **Auto-Token Completion**: Tokens automatically removed after prescription

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── doctor/            # Doctor dashboard pages
│   ├── patient/           # Patient pages
│   └── layout.js          # Root layout
├── components/            # Reusable React components
│   ├── ui/               # UI components
│   └── patient/          # Patient-specific components
└── lib/                  # Utility functions and configurations
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or Atlas connection string is correct
   - Check firewall settings for MongoDB Atlas

2. **Firebase Authentication Error**
   - Verify Firebase project configuration
   - Ensure Phone Authentication is enabled in Firebase Console

3. **Google Maps Not Loading**
   - Check if Google Maps API key is valid
   - Ensure Maps JavaScript API is enabled

4. **Port Already in Use**
   - Change port: `npm run dev -- -p 3001`
   - Or kill process using port 3000

### Environment Variables

Make sure all required environment variables are set in your `.env.local` file. The application will show errors if critical variables are missing.

## Database Collections

The app uses these MongoDB collections:
- `patients_profile` - Patient information
- `patients_mobileNumbers` - Phone number registry
- `doctors_list` - Doctor profiles
- `tokens` - Token management
- `prescriptions` - Medical prescriptions
- `hospital_locations` - Hospital coordinate data

## Need Help?

Check the console for error messages and ensure all environment variables are properly configured.