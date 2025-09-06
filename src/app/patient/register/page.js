"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { config, getGoogleMapsScriptUrl } from "@/lib/config"
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Heart, 
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Map
} from "lucide-react"

export default function PatientRegistration() {
  const [formData, setFormData] = useState({
    // Basic Information
    fullName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    bloodGroup: "",
    maritalStatus: "",
    
    // Contact Details
    mobileNumber: "",
    email: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    address: "",
    houseNo: "",
    city: "",
    state: "",
    pincode: "",
    
    // Identification
    patientId: "", // auto-generated
    aadhaarNumber: "",
    passportNumber: "",
    drivingLicense: "",
    idProofType: "",
    
    // Medical Information
    existingConditions: "",
    allergies: "",
    currentMedications: "",
    pastSurgeries: "",
    familyMedicalHistory: "",
    
    // Payment & Hospital
    paymentMethod: "",
    hospitalCity: "",
    hospitalName: "",
    department: "",
    preferredDoctor: "",
    reasonForVisit: "",
    appointmentDate: "",
    appointmentTime: "",
    
    // Consent
    consentAgreed: false
  })
  
  // Check for pending mobile number from login
  useEffect(() => {
    const pendingMobile = localStorage.getItem('pendingMobileNumber')
    if (pendingMobile) {
      setFormData(prev => ({ ...prev, mobileNumber: pendingMobile }))
      // Clear the pending mobile number
      localStorage.removeItem('pendingMobileNumber')
    }
  }, [])
  
  const [loading, setLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [error, setError] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otp, setOtp] = useState("")
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [aadhaarVerified, setAadhaarVerified] = useState(false)
  const [hospitalCoordinates, setHospitalCoordinates] = useState(null)
  const [geocodingLoading, setGeocodingLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [hospitals, setHospitals] = useState([])
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const marker = useRef(null)

  // Sample hospital data by city
  const hospitalsByCity = {
    "Bhopal": [
      { id: "1", name: "All India Institute of Medical Sciences (AIIMS)", address: "Saket Nagar, Bhopal" },
      { id: "2", name: "Hamidia Hospital", address: "Hamidia Road, Bhopal" },
      { id: "3", name: "People's Hospital", address: "Berasia Road, Bhopal" },
      { id: "4", name: "Bansal Hospital", address: "C-Sector, Shahpura, Bhopal" }
    ],
    "Delhi": [
      { id: "5", name: "All India Institute of Medical Sciences (AIIMS)", address: "Ansari Nagar, New Delhi" },
      { id: "6", name: "Safdarjung Hospital", address: "Safdarjung, New Delhi" },
      { id: "7", name: "Apollo Hospital", address: "Sarita Vihar, New Delhi" },
      { id: "8", name: "Fortis Hospital", address: "Shalimar Bagh, New Delhi" }
    ],
    "Mumbai": [
      { id: "9", name: "King Edward Memorial Hospital", address: "Parel, Mumbai" },
      { id: "10", name: "Tata Memorial Hospital", address: "Parel, Mumbai" },
      { id: "11", name: "Lilavati Hospital", address: "Bandra West, Mumbai" },
      { id: "12", name: "Hinduja Hospital", address: "Mahim, Mumbai" }
    ],
    "Indore": [
      { id: "13", name: "Maharaja Yeshwantrao Hospital", address: "M.G. Road, Indore" },
      { id: "14", name: "Apollo Hospital", address: "Vijay Nagar, Indore" },
      { id: "15", name: "Bombay Hospital", address: "Indore" },
      { id: "16", name: "Greater Kailash Hospital", address: "Indore" }
    ]
  }

  // Age calculation from DOB
  const calculateAge = (dob) => {
    if (!dob) return ""
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age.toString()
  }

  // Handle hospital city change
  const handleHospitalCityChange = (city) => {
    setFormData(prev => ({
      ...prev,
      hospitalCity: city,
      hospitalName: "", // Reset hospital selection
      department: "",
      preferredDoctor: ""
    }))
    setHospitals(hospitalsByCity[city] || [])
  }

  // Generate patient ID
  const generatePatientId = () => {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `P${timestamp}${randomStr}`
  }

  // Load Google Maps API
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return
    
    // Skip Google Maps loading if disabled
    if (!config.googleMaps.enabled) return
    
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap()
        return
      }
      
      const script = document.createElement('script')
      script.src = getGoogleMapsScriptUrl()
      script.async = true
      script.defer = true
      
      window.initMap = initMap
      document.head.appendChild(script)
    }
    
    loadGoogleMaps()
  }, [])

  const initMap = () => {
    if (typeof window === 'undefined') return
    if (!mapRef.current || !window.google) return
    
    try {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        styles: [
          {
            featureType: "poi.business",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      })
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-calculate age when DOB changes
    if (field === 'dateOfBirth' && value) {
      const today = new Date()
      const birthDate = new Date(value)
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFormData(prev => ({ ...prev, age: age - 1 }))
      } else {
        setFormData(prev => ({ ...prev, age: age }))
      }
    }
  }

  const handleAadhaarSubmit = async () => {
    if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number")
      return
    }
    
    setLoading(true)
    setError("")
    
    try {
      // Simulate Aadhaar verification API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, we'll simulate successful verification
      // In production, this would call the actual Aadhaar verification API
      setShowOtpInput(true)
      setLoading(false)
    } catch (error) {
      setError("Failed to send OTP. Please try again.")
      setLoading(false)
    }
  }

  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }
    
    setVerifyingOtp(true)
    setError("")
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, any 6-digit OTP will work
      if (otp.length === 6) {
        setAadhaarVerified(true)
        setShowOtpInput(false)
        setError("")
      } else {
        setError("Invalid OTP. Please try again.")
      }
    } catch (error) {
      setError("OTP verification failed. Please try again.")
    } finally {
      setVerifyingOtp(false)
    }
  }

  const geocodeHospital = async () => {
    if (!formData.hospitalName || !formData.city) {
      setError("Please enter both hospital name and city")
      return
    }
    
    setGeocodingLoading(true)
    setError("")
    
    try {
      const address = `${formData.hospitalName}, ${formData.city}, India`
      
      if (config.googleMaps.enabled && typeof window !== 'undefined' && window.google && window.google.maps) {
        // Use Google Maps Geocoding API
        const geocoder = new window.google.maps.Geocoder()
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location
            const coordinates = {
              lat: location.lat(),
              lng: location.lng()
            }
            
            setHospitalCoordinates(coordinates)
            
            // Update map
            if (mapInstance.current) {
              try {
                mapInstance.current.setCenter(coordinates)
                mapInstance.current.setZoom(15)
                
                if (marker.current) {
                  marker.current.setMap(null)
                }
                
                marker.current = new window.google.maps.Marker({
                  position: coordinates,
                  map: mapInstance.current,
                  title: formData.hospitalName,
                  icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/hospital.png',
                    scaledSize: new window.google.maps.Size(32, 32)
                  }
                })
                
                // Add info window
                const infoWindow = new window.google.maps.InfoWindow({
                  content: `
                    <div class="p-2">
                      <h3 class="font-semibold">${formData.hospitalName}</h3>
                      <p class="text-sm text-gray-600">${formData.city}, India</p>
                      <p class="text-xs text-gray-500">${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}</p>
                    </div>
                  `
                })
                
                marker.current.addListener('click', () => {
                  infoWindow.open(mapInstance.current, marker.current)
                })
                
                setError("")
              } catch (error) {
                console.error('Error updating map:', error)
                setError("Map update failed, but coordinates were saved")
              }
            }
          } else {
            setError(`Geocoding failed: ${status}. Please check the hospital name and city.`)
          }
          setGeocodingLoading(false)
        })
      } else {
        // Fallback to mock coordinates if Google Maps is not available
        console.warn('Google Maps not available, using fallback coordinates')
        const fallbackCoordinates = {
          lat: 20.5937 + (Math.random() - 0.5) * 0.1,
          lng: 78.9629 + (Math.random() - 0.5) * 0.1
        }
        
        setHospitalCoordinates(fallbackCoordinates)
        setError("Google Maps not available. Using approximate location.")
        setGeocodingLoading(false)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setError("Failed to geocode hospital location. Please check the address and try again.")
      setGeocodingLoading(false)
    }
  }

  const handleRegistration = async () => {
    if (!aadhaarVerified) {
      setError("Please verify your Aadhaar number first")
      return
    }
    
    if (!hospitalCoordinates) {
      setError("Please geocode the hospital location first")
      return
    }
    
    if (!formData.department) {
      setError("Please select a department")
      return
    }
    
    setLoading(true)
    setError("")
    
    try {
      const registrationData = {
        ...formData,
        hospitalCoordinates,
        status: "Registered",
        tokenStatus: "Token Pending",
        registrationDate: new Date().toISOString()
      }
      
      const response = await fetch('/api/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setRegistrationSuccess(true)
        // Store patient data for location tracking
        localStorage.setItem('pendingPatientData', JSON.stringify(result.patient))
      } else {
        setError(result.message || "Registration failed. Please try again.")
      }
    } catch (error) {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your registration has been completed. A token will be automatically generated when you arrive within 100 meters of the hospital.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ul className="text-sm text-blue-800 text-left space-y-1">
                <li>• Visit the hospital location</li>
                <li>• Enable location services on your device</li>
                <li>• Token will be generated automatically</li>
                <li>• Check your dashboard for updates</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.href = "/patient/login"}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Registration</h1>
          <p className="text-gray-600">Complete your registration to get started with our hospital management system</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={formData.age}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    value={formData.mobileNumber}
                    readOnly
                    placeholder="Mobile number (from login)"
                    required
                  />
                  {formData.mobileNumber && (
                    <p className="text-xs text-blue-600 mt-1">✓ Mobile number verified from login</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.bloodGroup}
                    onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aadhaar Verification & Hospital Details */}
          <div className="space-y-6">
            {/* Aadhaar Verification */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Aadhaar Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.aadhaarNumber}
                    onChange={(e) => handleInputChange("aadhaarNumber", e.target.value.replace(/\D/g, ''))}
                    placeholder="12-digit Aadhaar number"
                    maxLength="12"
                    required
                  />
                </div>

                {!aadhaarVerified && (
                  <div>
                    {!showOtpInput ? (
                      <Button 
                        onClick={handleAadhaarSubmit}
                        disabled={loading || !formData.aadhaarNumber || formData.aadhaarNumber.length !== 12}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        Send OTP
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 6-digit OTP"
                          maxLength="6"
                        />
                        <Button 
                          onClick={handleOtpVerification}
                          disabled={verifyingOtp || !otp || otp.length !== 6}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {verifyingOtp ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Verify OTP
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {aadhaarVerified && (
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Aadhaar verified successfully!</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hospital Details */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="w-5 h-5 mr-2 text-red-600" />
                  Hospital Details
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Enter the hospital name and city to automatically find the exact location coordinates. 
                  This ensures accurate token generation when you arrive at the hospital.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.hospitalName}
                    onChange={(e) => handleInputChange("hospitalName", e.target.value)}
                    placeholder="e.g., Apollo Hospital, Fortis Hospital, etc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={geocodeHospital}
                    disabled={geocodingLoading || !formData.hospitalName || !formData.city}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {geocodingLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Map className="w-4 h-4 mr-2" />
                    )}
                    {geocodingLoading ? 'Finding Hospital Location...' : 'Find Hospital Location'}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    This will use Google Maps to find the exact coordinates of the hospital
                  </p>
                </div>

                {hospitalCoordinates && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Hospital Location Found!</span>
                    </div>
                    <div className="space-y-1 text-sm text-green-700">
                      <p><strong>Coordinates:</strong> {hospitalCoordinates.lat.toFixed(6)}, {hospitalCoordinates.lng.toFixed(6)}</p>
                      <p><strong>Address:</strong> {formData.hospitalName}, {formData.city}, India</p>
                      <p className="text-xs text-green-600">✓ Location will be used for token generation</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Display */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Map className="w-5 h-5 mr-2 text-purple-600" />
                  Hospital Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mapRef}
                  className="w-full h-64 rounded-lg border border-gray-300"
                >
                  {!config.googleMaps.enabled ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2">Google Maps is currently disabled</p>
                        <p className="text-xs text-gray-400">Hospital location will be saved with coordinates</p>
                      </div>
                    </div>
                  ) : typeof window === 'undefined' || !window.google ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                        <p className="text-gray-500">Loading Google Maps...</p>
                        <p className="text-xs text-gray-400">Please wait while the map initializes</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2">Map Ready</p>
                        <p className="text-xs text-gray-400">Click "Find Hospital Location" to see the hospital on the map</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-sm text-gray-600 text-center">
                  {hospitalCoordinates ? (
                    <span className="text-green-600">🏥 Hospital location marked on the map above</span>
                  ) : (
                    <span>Enter hospital details and click "Find Hospital Location" to see it on the map</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Registration Button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={handleRegistration}
            disabled={loading || !aadhaarVerified || !hospitalCoordinates || !formData.department}
            size="lg"
            className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <User className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Registering...' : 'Complete Registration'}
          </Button>
        </div>
      </div>
    </div>
  )
}
