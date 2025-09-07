"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { config, getGoogleMapsScriptUrl } from "@/lib/config"
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Map,
  Clock,
  User
} from "lucide-react"

export default function LocationTracker({ patientData }) {
  // Debug log to see what data is being passed
  useEffect(() => {
    console.log('LocationTracker received patientData:', patientData)
  }, [patientData])

  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationError, setLocationError] = useState("")
  const [isTracking, setIsTracking] = useState(false)
  const [distance, setDistance] = useState(null)
  const [tokenGenerated, setTokenGenerated] = useState(false)
  const [tokenData, setTokenData] = useState(null)
  const [generatingToken, setGeneratingToken] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [locationPermission, setLocationPermission] = useState(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [qrCodeInput, setQrCodeInput] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  
  const locationInterval = useRef(null)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const patientMarker = useRef(null)
  const hospitalMarker = useRef(null)

  // Load Google Maps API only if enabled and not already loaded
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return
    
    // Skip Google Maps loading if disabled
    if (!config.googleMaps.enabled) return
    
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap()
      return
    }
    
    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for existing script to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps)
          initMap()
        }
      }, 100)
      
      return () => clearInterval(checkGoogleMaps)
    }
    
    const loadGoogleMaps = () => {
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
        zoom: 15,
        styles: [
          {
            featureType: "poi.business",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      })
    } catch (error) {
      console.error('Error initializing map in LocationTracker:', error)
    }
  }

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return
    }

    if (!patientData?.hospitalCoordinates) {
      setLocationError("Hospital coordinates not found. Please complete registration first.")
      setIsTracking(false)
      return
    }

    setIsTracking(true)
    setLocationError("")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        
        // Calculate distance to hospital if we have hospital coordinates
        if (patientData?.hospitalCoordinates) {
          const dist = calculateDistance(
            latitude, 
            longitude, 
            patientData.hospitalCoordinates.lat, 
            patientData.hospitalCoordinates.lng
          )
          setDistance(Math.round(dist))
          
          // Update map
          updateMap(latitude, longitude)
          
          // Check if patient is within 100 meters
          if (dist <= 100 && !tokenGenerated) {
            handleTokenGeneration(latitude, longitude)
          }
        }
      },
             (error) => {
        let errorMessage = 'Unknown error'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your GPS/location services.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
          default:
            errorMessage = error.message || 'Failed to get location. Please try again.'
        }
        
        setLocationError(errorMessage)
        setIsTracking(false)
        console.error('Location error:', {
          code: error.code,
          message: error.message,
          type: error.constructor.name
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Check location permission
  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return false
    }

    if (!navigator.permissions) {
      // Fallback for browsers without permissions API
      return true
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      setLocationPermission(permission.state)
      
      if (permission.state === 'denied') {
        setShowLocationPrompt(true)
        return false
      }
      
      return permission.state === 'granted' || permission.state === 'prompt'
    } catch (error) {
      console.log('Permission API not available, proceeding with geolocation request')
      return true
    }
  }

  // Request location permission
  const requestLocationPermission = () => {
    setShowLocationPrompt(false)
    setLocationError("")
    startLocationTracking()
  }

  // Start continuous location tracking
  const startLocationTracking = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return
    }

    if (!patientData?.hospitalCoordinates) {
      setLocationError("Hospital coordinates not found. Please complete registration first.")
      return
    }

    // Check permission first
    const hasPermission = await checkLocationPermission()
    if (!hasPermission && locationPermission === 'denied') {
      return
    }

    setIsTracking(true)
    setLocationError("")

    // Get initial location
    getCurrentLocation()

    // Set up continuous tracking every 10 seconds
    locationInterval.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          
          if (patientData?.hospitalCoordinates) {
            const dist = calculateDistance(
              latitude, 
              longitude, 
              patientData.hospitalCoordinates.lat, 
              patientData.hospitalCoordinates.lng
            )
            setDistance(Math.round(dist))
            
            // Update map
            updateMap(latitude, longitude)
            
            // Check if patient is within 100 meters
            if (dist <= 100 && !tokenGenerated) {
              handleTokenGeneration(latitude, longitude)
            }
          }
        },
                 (error) => {
           let errorMessage = 'Unknown error'
           
           switch (error.code) {
             case error.PERMISSION_DENIED:
               errorMessage = 'Location permission denied. Please enable location access in your browser settings and refresh the page.'
               break
             case error.POSITION_UNAVAILABLE:
               errorMessage = 'Location information unavailable. Please check your GPS/location services.'
               break
             case error.TIMEOUT:
               errorMessage = 'Location request timed out. Please try again.'
               break
             default:
               errorMessage = error.message || 'Failed to get location. Please try again.'
           }
           
           setLocationError(errorMessage)
           setIsTracking(false)
           console.error('Location tracking error:', {
             code: error.code,
             message: error.message,
             type: error.constructor.name
           })
         },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    }, 10000) // Check every 10 seconds
  }

  // Stop location tracking
  const stopLocationTracking = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current)
      locationInterval.current = null
    }
    setIsTracking(false)
  }

  // Update map with current location
  const updateMap = (lat, lng) => {
    if (typeof window === 'undefined') return
    if (!mapInstance.current || !window.google) return

    try {
      // Center map on patient location
      mapInstance.current.setCenter({ lat, lng })
      mapInstance.current.setZoom(16)

      // Update patient marker
      if (patientMarker.current) {
        patientMarker.current.setMap(null)
      }

      patientMarker.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        title: "Your Location",
        icon: {
          url: 'https://maps.google.com/maps/files/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      })

      // Add hospital marker if we have coordinates
      if (patientData?.hospitalCoordinates && !hospitalMarker.current) {
        hospitalMarker.current = new window.google.maps.Marker({
          position: patientData.hospitalCoordinates,
          map: mapInstance.current,
          title: patientData.hospitalName,
          icon: {
            url: 'https://maps.google.com/maps/files/ms/icons/hospital.png',
            scaledSize: new window.google.maps.Size(32, 32)
          }
        })

        // Draw circle showing 100m radius
        new window.google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.1,
          map: mapInstance.current,
          center: patientData.hospitalCoordinates,
          radius: 100
        })
      }
    } catch (error) {
      console.error('Error updating map:', error)
    }
  }

  // Handle token generation
  const handleTokenGeneration = async (lat, lng) => {
    if (!patientData?.patientId) return

    setGeneratingToken(true)
    
    try {
      const response = await fetch('/api/patients/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientData.patientId,
          currentLat: lat,
          currentLng: lng
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setTokenGenerated(true)
        setTokenData(result.token)
        
        // Show success notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Token Generated!', {
            body: `Your token ${result.token.tokenNumber} has been generated for ${result.token.department}`,
            icon: '/favicon.ico'
          })
        }
        
        // Stop location tracking
        stopLocationTracking()
        
        // Update patient data in localStorage
        const updatedPatientData = {
          ...patientData,
          tokenStatus: "Token Generated",
          tokenNumber: result.token.tokenNumber
        }
        localStorage.setItem('patientData', JSON.stringify(updatedPatientData))
        
      } else {
        setLocationError(result.message)
      }
    } catch (error) {
      setLocationError("Failed to generate token. Please try again.")
    } finally {
      setGeneratingToken(false)
    }
  }

  // Handle Test Hospital token generation (always within 100m)
  const handleTestHospitalTokenGeneration = async () => {
    if (generatingToken || tokenGenerated) return
    
    setGeneratingToken(true)
    
    try {
      // Use mock coordinates for Test Hospital (doesn't matter as it's always within 100m)
      const mockLat = 20.5937
      const mockLng = 78.9629
      
      const response = await fetch('/api/patients/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientData.patientId,
          currentLat: mockLat,
          currentLng: mockLng
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTokenGenerated(true)
        setTokenData(data.token)
        
        // Show success notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Test Hospital Token Generated!', {
            body: `Your token ${data.token.tokenNumber} has been generated for ${data.token.department} at Test Hospital`,
            icon: '/favicon.ico'
          })
        }
        
        // Update patient data in localStorage
        const updatedPatientData = {
          ...patientData,
          tokenStatus: "Token Generated",
          tokenNumber: data.token.tokenNumber
        }
        localStorage.setItem('patientData', JSON.stringify(updatedPatientData))
        
        alert('Test Hospital token generated successfully! Your token number is: ' + data.token.tokenNumber)
      } else {
        console.error('Test Hospital token generation failed:', data.message)
        setLocationError(data.message || 'Failed to generate token for Test Hospital')
      }
    } catch (error) {
      console.error('Test Hospital token generation error:', error)
      setLocationError('Network error. Please try again.')
    } finally {
      setGeneratingToken(false)
    }
  }

  // Handle QR code token generation
  const handleQRCodeGeneration = async () => {
    if (!qrCodeInput.trim()) {
      setLocationError("Please enter or scan a QR code")
      return
    }

    setGeneratingToken(true)
    
    try {
      // Parse QR code - expecting format: HOSPITAL|DEPARTMENT|PATIENT_ID
      const qrParts = qrCodeInput.split('|')
      if (qrParts.length !== 3) {
        throw new Error("Invalid QR code format")
      }

      const [qrHospital, qrDepartment, qrPatientId] = qrParts
      
      // Verify patient ID matches
      if (qrPatientId !== patientData.patientId) {
        throw new Error("QR code does not match your patient ID")
      }

      // Generate token using mock coordinates (QR bypasses location requirement)
      const response = await fetch('/api/patients/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientData.patientId,
          currentLat: 20.5937, // Mock coordinates for QR generation
          currentLng: 78.9629,
          qrCodeGeneration: true
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTokenGenerated(true)
        setTokenData(data.token)
        setShowQRScanner(false)
        setQrCodeInput('')
        
        // Update patient data in localStorage
        const updatedPatientData = {
          ...patientData,
          tokenStatus: "Token Generated",
          tokenNumber: data.token.tokenNumber
        }
        localStorage.setItem('patientData', JSON.stringify(updatedPatientData))
        
        alert('QR Code token generated successfully! Your token number is: ' + data.token.tokenNumber)
      } else {
        setLocationError(data.message || 'Failed to generate token using QR code')
      }
    } catch (error) {
      console.error('QR Code token generation error:', error)
      setLocationError(error.message || 'Invalid QR code. Please try again.')
    } finally {
      setGeneratingToken(false)
    }
  }

  // Handle token cancellation
  const handleCancelToken = async () => {
    if (!tokenData) return

    setGeneratingToken(true)
    
    try {
      const response = await fetch('/api/patients/cancel-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientData.patientId,
          tokenNumber: tokenData.tokenNumber
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTokenGenerated(false)
        setTokenData(null)
        setShowCancelConfirm(false)
        
        // Update patient data in localStorage
        const updatedPatientData = {
          ...patientData,
          tokenStatus: "Registered",
          tokenNumber: null
        }
        localStorage.setItem('patientData', JSON.stringify(updatedPatientData))
        
        alert('Token cancelled successfully!')
      } else {
        setLocationError(data.message || 'Failed to cancel token')
      }
    } catch (error) {
      console.error('Token cancellation error:', error)
      setLocationError('Network error. Please try again.')
    } finally {
      setGeneratingToken(false)
    }
  }

  // Haversine formula to calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c // Distance in kilometers
    return distance * 1000 // Convert to meters
  }

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current)
      }
    }
  }, [])

  if (tokenGenerated && tokenData) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-green-600">
            <CheckCircle className="w-6 h-6 mr-2" />
            Token Generated Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white text-center">
            <div className="text-4xl font-bold mb-2">{tokenData.tokenNumber}</div>
            <p className="text-green-100 text-lg mb-4">
              {tokenData.department} • {tokenData.hospitalName}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center">
                <User className="w-4 h-4 mr-2" />
                <span>{tokenData.patientName}</span>
              </div>
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>Generated at {new Date(tokenData.generatedAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Distance: {tokenData.distance}m from hospital</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Please proceed to the hospital reception with this token number.
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show existing token if patient already has one
  if (patientData?.tokenNumber && patientData?.tokenStatus === "Token Generated") {
    return (
      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-green-600">
            <CheckCircle className="w-6 h-6 mr-2" />
            Your Current Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white text-center">
            <div className="text-4xl font-bold mb-2">{patientData.tokenNumber}</div>
            <p className="text-green-100 text-lg mb-4">
              {patientData.department || 'General'} • {patientData.hospitalName || 'Hospital'}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center">
                <User className="w-4 h-4 mr-2" />
                <span>{patientData.fullName}</span>
              </div>
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>Token Status: Active</span>
              </div>
              <div className="flex items-center justify-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Please proceed to hospital reception</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Show this token number at the hospital reception desk.
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => setShowCancelConfirm(true)}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              size="sm"
            >
              Cancel Token
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show registration prompt if hospital coordinates are missing
  // Check if this is Test Hospital
  const isTestHospital = patientData?.hospitalName === "Test Hospital"
  
  if (!patientData?.hospitalCoordinates && !isTestHospital) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
            Registration Incomplete
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto flex items-center justify-center">
              <MapPin className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Hospital Location Missing</h3>
              <p className="text-gray-600 text-sm mb-4">
                Your registration is incomplete. Hospital coordinates are required for location-based token generation.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = "/patient/register"}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Complete Registration
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Test Hospital Token Generation Card */}
      {isTestHospital && !tokenGenerated && (
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              🧪 Test Hospital - Token Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Test Hospital Selected</h3>
                <p className="text-gray-600 text-sm mb-4">
                  You have selected Test Hospital. Click the button below to generate your token for testing purposes.
                </p>
                <p className="text-green-700 text-xs mb-4">
                  Note: Test Hospital is always considered within 100m of your location for testing.
                </p>
              </div>
              <Button 
                onClick={() => handleTestHospitalTokenGeneration()}
                disabled={generatingToken}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                {generatingToken ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Token...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Click here to Generate Token
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Status Card */}
      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Navigation className="w-5 h-5 mr-2 text-blue-600" />
            Location Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentLocation ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">Current Location</span>
                </div>
                <span className="text-sm text-blue-600">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </span>
              </div>
              
              {distance !== null && (
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  distance <= 100 ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <div className="flex items-center">
                    <MapPin className={`w-4 h-4 mr-2 ${
                      distance <= 100 ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                    <span className={`font-medium ${
                      distance <= 100 ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      Distance to Hospital
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    distance <= 100 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {distance}m
                  </span>
                </div>
              )}

              {distance !== null && distance <= 100 && (
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    You're within 100 meters! Token will be generated automatically.
                  </span>
                </div>
              )}

              {distance !== null && distance > 100 && (
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-yellow-800 font-medium">
                      You need to get closer to the hospital to generate a token.
                    </span>
                  </div>
                  
                  {/* QR Scanner Option */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm mb-2">
                      Can't get close enough? Use the QR code at the hospital reception.
                    </p>
                    <Button 
                      onClick={() => setShowQRScanner(true)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Use QR Code Instead
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
                       <div className="text-center py-6">
             <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
             {!patientData?.hospitalCoordinates ? (
               <div className="space-y-2">
                 <p className="text-red-600 font-medium">Hospital coordinates not found</p>
                 <p className="text-gray-600 text-sm">
                   Please complete your registration with hospital details first
                 </p>
               </div>
             ) : (
               <p className="text-gray-600 mb-4">
                 Enable location tracking to monitor your distance from the hospital
               </p>
             )}
           </div>
          )}

          <div className="flex space-x-3">
                         {!isTracking ? (
               <Button 
                 onClick={startLocationTracking}
                 className="flex-1 bg-blue-600 hover:bg-blue-700"
                 disabled={!patientData?.hospitalCoordinates}
               >
                 <Navigation className="w-4 h-4 mr-2" />
                 {!patientData?.hospitalCoordinates ? 'No Hospital Data' : 'Start Tracking'}
               </Button>
             ) : (
              <Button 
                onClick={stopLocationTracking}
                variant="outline"
                className="flex-1"
              >
                Stop Tracking
              </Button>
            )}
            
            {config.googleMaps.enabled && (
              <Button 
                onClick={() => setShowMap(!showMap)}
                variant="outline"
                className="flex-1"
              >
                <Map className="w-4 h-4 mr-2" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
            )}
          </div>

          {locationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{locationError}</span>
              </div>
            </div>
          )}

          {showLocationPrompt && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-800 mb-2">Location Access Required</h4>
                  <p className="text-sm text-orange-700 mb-3">
                    Location access is currently blocked. To enable automatic token generation when you're near the hospital, please:
                  </p>
                  <ol className="text-sm text-orange-700 mb-4 space-y-1">
                    <li>1. Click the location icon 📍 in your browser's address bar</li>
                    <li>2. Select "Allow" for location access</li>
                    <li>3. Click "Try Again" below</li>
                  </ol>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={requestLocationPermission}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Try Again
                    </Button>
                    <Button 
                      onClick={() => setShowLocationPrompt(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {generatingToken && (
            <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
              <Loader2 className="w-4 h-4 text-blue-600 mr-2 animate-spin" />
              <span className="text-blue-800">Generating token...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Display */}
      {showMap && config.googleMaps.enabled && (
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Map className="w-5 h-5 mr-2 text-purple-600" />
              Live Location Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef}
              className="w-full h-80 rounded-lg border border-gray-300"
            >
              {!config.googleMaps.enabled ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 mb-2">Google Maps is currently disabled</p>
                    <p className="text-xs text-gray-400">Location tracking works without map display</p>
                  </div>
                </div>
              ) : typeof window === 'undefined' || !window.google ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">Loading map...</p>
                </div>
              ) : null}
            </div>
            <div className="mt-3 text-sm text-gray-600 text-center">
              {currentLocation ? (
                <span>🔵 Your location • 🏥 Hospital • 🔴 100m radius</span>
              ) : (
                <span>Start location tracking to see your position on the map</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Map className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Scan QR Code at Hospital</h3>
              <p className="text-gray-600 text-sm mb-4">
                Ask the hospital reception for a QR code or enter the code manually below.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code or Manual Entry
              </label>
              <input
                type="text"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                placeholder="Scan QR code or enter: HOSPITAL|DEPARTMENT|PATIENT_ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format example: General Hospital|Cardiology|PAT123456
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleQRCodeGeneration}
                disabled={generatingToken || !qrCodeInput.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {generatingToken ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Token"
                )}
              </Button>
              <Button 
                onClick={() => {
                  setShowQRScanner(false)
                  setQrCodeInput('')
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Token Confirmation */}
      {showCancelConfirm && (
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Cancel Token Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cancel Your Token?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Are you sure you want to cancel token <strong>{tokenData?.tokenNumber}</strong>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleCancelToken}
                disabled={generatingToken}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {generatingToken ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Token"
                )}
              </Button>
              <Button 
                onClick={() => setShowCancelConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Keep Token
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
