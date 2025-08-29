# Smart Hospital Management System

A modern, full-stack hospital management system built with Next.js, MongoDB, and Firebase authentication.

## Features

### Patient Management
- **Mobile-based Login**: Secure OTP verification using Firebase
- **Smart Registration Flow**: 
  - New patients are redirected to registration after OTP verification
  - Existing patients are automatically logged into their dashboard
- **Patient Dashboard**: Modern, responsive interface displaying patient information
- **Profile Management**: Edit and update patient profiles with real-time MongoDB updates

### Database Structure
The system uses MongoDB Atlas with the following collections:
- `patients_profile` - Stores complete patient information
- `patients_mobileNumbers` - Tracks registered mobile numbers for quick lookups
- `doctors_list` - Specialized doctor information (with fallback to default list)

### Technical Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Phone Authentication
- **UI Components**: Custom component library with Radix UI primitives

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

4. Configure Firebase:
Update `src/lib/firebase.js` with your Firebase configuration.

5. Run the development server:
```bash
npm run dev
```

## System Flow

### Patient Login Flow
1. **Mobile Number Input**: Patient enters their mobile number
2. **OTP Verification**: Firebase sends and verifies OTP
3. **Database Check**: System checks if mobile number exists in MongoDB
4. **Routing Decision**:
   - **Existing Patient**: Redirected to dashboard with profile data
   - **New Patient**: Redirected to registration form

### Registration Process
1. **Form Collection**: Gathers required patient information:
   - Full Name
   - Age
   - Gender
   - Mobile Number (auto-filled)
   - Problem/Symptoms Description
   - Specialized Doctor Selection
2. **Data Storage**: Saves to MongoDB in both collections
3. **Dashboard Access**: Redirects to patient dashboard

### Dashboard Features
- **Profile Display**: Shows all patient information in a clean, modern UI
- **Profile Editing**: Inline editing with real-time updates
- **Appointment Management**: Book and view appointments
- **Medical Records**: Access to medical history
- **AI Symptom Checker**: Basic symptom analysis
- **Notifications**: Real-time updates and alerts

## API Endpoints

### `/api/patients`
- `POST` - Handle patient operations:
  - `action: 'checkMobile'` - Check if mobile number exists
  - `action: 'createPatient'` - Create new patient profile
  - `action: 'updatePatient'` - Update existing patient profile

### `/api/doctors`
- `GET` - Retrieve list of specialized doctors

## Database Schema

### Patient Profile
```javascript
{
  fullName: String,
  age: Number,
  gender: String,
  mobileNumber: String,
  problemDescription: String,
  specializedDoctor: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Mobile Numbers Collection
```javascript
{
  mobileNumber: String,
  createdAt: Date
}
```

### Doctors Collection
```javascript
{
  name: String,
  specialization: String,
  department: String
}
```

## Security Features
- Firebase Phone Authentication
- MongoDB injection protection
- Input validation and sanitization
- Secure API endpoints

## UI/UX Features
- Responsive design for all devices
- Modern gradient backgrounds
- Smooth animations and transitions
- Loading states and error handling
- Intuitive navigation and user flow

## Future Enhancements
- Doctor dashboard and management
- Appointment scheduling system
- Medical record management
- Prescription management
- Payment integration
- Multi-language support

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is licensed under the MIT License.

## Support
For support and questions, please open an issue in the repository.
