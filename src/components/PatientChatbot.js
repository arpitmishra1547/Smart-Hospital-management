"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input.jsx"
import { 
  MessageCircle, 
  Send, 
  X, 
  User, 
  Bot, 
  Phone, 
  MapPin, 
  Clock, 
  FileText,
  HelpCircle,
  Minimize2,
  Maximize2
} from "lucide-react"

export default function PatientChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '👋 Welcome to SmartCare Hospital Patient Assistant Bot.\n\nPlease choose an option:',
      options: [
        { id: 1, text: '1️⃣ Register as Patient', value: 'register' },
        { id: 2, text: '2️⃣ My Token Number', value: 'token' },
        { id: 3, text: '3️⃣ Appointment Time', value: 'appointment' },
        { id: 4, text: '4️⃣ Doctor & OPD Info', value: 'doctors' },
        { id: 5, text: '5️⃣ Hospital Location / Distance', value: 'location' },
        { id: 6, text: '6️⃣ Help / FAQs', value: 'help' }
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [currentFlow, setCurrentFlow] = useState(null)
  const [registrationData, setRegistrationData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (type, content, options = null) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      options,
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addUserMessage = (content) => {
    addMessage('user', content)
  }

  const addBotMessage = (content, options = null) => {
    addMessage('bot', content, options)
  }

  const handleMainMenuOption = (option) => {
    addUserMessage(option.text)
    
    switch(option.value) {
      case 'register':
        setCurrentFlow('register')
        addBotMessage('📝 Let\'s start your registration. Please enter your Full Name:')
        break
      case 'token':
        setCurrentFlow('token')
        addBotMessage('📱 Please enter your Mobile Number (used during registration):')
        break
      case 'appointment':
        setCurrentFlow('appointment')
        addBotMessage('📱 Please enter your Mobile Number:')
        break
      case 'doctors':
        handleDoctorsInfo()
        break
      case 'location':
        setCurrentFlow('location')
        addBotMessage('📍 Please share your current location.\n\nClick "Get Location" to automatically detect your location or enter manually:', null, [
          { id: 'location', text: '📍 Get My Location', value: 'get_location' },
          { id: 'manual', text: '✍️ Enter Manually', value: 'manual_location' }
        ])
        break
      case 'help':
        handleHelp()
        break
    }
  }

  const handleRegistrationFlow = async (input) => {
    const steps = ['name', 'age', 'gender', 'mobile', 'department', 'hospital']
    const currentStep = Object.keys(registrationData).length
    
    switch(steps[currentStep]) {
      case 'name':
        setRegistrationData(prev => ({ ...prev, name: input }))
        addBotMessage('📅 Please enter your Age:')
        break
      case 'age':
        setRegistrationData(prev => ({ ...prev, age: input }))
        addBotMessage('⚧ Please enter your Gender:', null, [
          { id: 'male', text: 'Male', value: 'Male' },
          { id: 'female', text: 'Female', value: 'Female' },
          { id: 'other', text: 'Other', value: 'Other' }
        ])
        break
      case 'gender':
        setRegistrationData(prev => ({ ...prev, gender: input }))
        addBotMessage('📱 Please enter your Mobile Number:')
        break
      case 'mobile':
        setRegistrationData(prev => ({ ...prev, mobile: input }))
        addBotMessage('🏥 Please select your Department:', null, [
          { id: 'cardiology', text: '1️⃣ Cardiology', value: 'Cardiology' },
          { id: 'orthopedics', text: '2️⃣ Orthopedics', value: 'Orthopedics' },
          { id: 'neurology', text: '3️⃣ Neurology', value: 'Neurology' },
          { id: 'pediatrics', text: '4️⃣ Pediatrics', value: 'Pediatrics' },
          { id: 'general', text: '5️⃣ General Medicine', value: 'General Medicine' }
        ])
        break
      case 'department':
        setRegistrationData(prev => ({ ...prev, department: input }))
        addBotMessage('🏨 Please enter your Hospital Name:')
        break
      case 'hospital':
        await handleRegistrationComplete({ ...registrationData, hospital: input })
        break
    }
  }

  const handleRegistrationComplete = async (data) => {
    setIsLoading(true)
    try {
      // Check if hospital is AIIMS Bhopal
      if (data.hospital.toLowerCase().includes('aiims') && data.hospital.toLowerCase().includes('bhopal')) {
        // Register patient in database
        const response = await fetch('/api/patients/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (response.ok) {
          const result = await response.json()
          addBotMessage(`✅ Registration Complete.\n🎫 Your Token Number is ${result.tokenNumber}.\nPlease proceed to ${data.department} OPD Room.`)
        } else {
          addBotMessage('❌ Registration failed. Please try again.')
        }
      } else {
        addBotMessage('📍 Please move within 100m of the hospital.\nOnce you are near, your token will be generated automatically.')
      }
    } catch (error) {
      addBotMessage('❌ Registration failed. Please try again.')
    }
    
    setIsLoading(false)
    setCurrentFlow(null)
    setRegistrationData({})
    setTimeout(() => {
      addBotMessage('Is there anything else I can help you with?', [
        { id: 'menu', text: '🏠 Back to Main Menu', value: 'main_menu' }
      ])
    }, 2000)
  }

  const handleTokenLookup = async (mobile) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/patients/token?mobile=${mobile}`)
      if (response.ok) {
        const result = await response.json()
        addBotMessage(`🎫 Your Token Number is: ${result.tokenNumber}\n⏳ Queue Status: ${result.queuePosition} patients ahead of you.`)
      } else {
        addBotMessage('❌ No token found for this mobile number. Please register first.')
      }
    } catch (error) {
      addBotMessage('❌ Unable to fetch token information. Please try again.')
    }
    setIsLoading(false)
    setCurrentFlow(null)
    setTimeout(() => {
      addBotMessage('Is there anything else I can help you with?', [
        { id: 'menu', text: '🏠 Back to Main Menu', value: 'main_menu' }
      ])
    }, 2000)
  }

  const handleAppointmentLookup = async (mobile) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/patients/appointment?mobile=${mobile}`)
      if (response.ok) {
        const result = await response.json()
        addBotMessage(`🕑 Your Appointment Time: ${result.appointmentTime}\n👨‍⚕️ Doctor: ${result.doctorName} (${result.department})`)
      } else {
        addBotMessage('❌ No appointment found for this mobile number.')
      }
    } catch (error) {
      addBotMessage('❌ Unable to fetch appointment information. Please try again.')
    }
    setIsLoading(false)
    setCurrentFlow(null)
    setTimeout(() => {
      addBotMessage('Is there anything else I can help you with?', [
        { id: 'menu', text: '🏠 Back to Main Menu', value: 'main_menu' }
      ])
    }, 2000)
  }

  const handleDoctorsInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/doctors/today')
      if (response.ok) {
        const doctors = await response.json()
        let doctorInfo = '👨‍⚕️ Today\'s Doctors and OPD Rooms:\n\n'
        doctors.forEach(doctor => {
          doctorInfo += `- ${doctor.department}: ${doctor.name} → Room ${doctor.room}\n`
        })
        addBotMessage(doctorInfo)
      } else {
        addBotMessage('❌ Unable to fetch doctor information at the moment.')
      }
    } catch (error) {
      addBotMessage('❌ Unable to fetch doctor information. Please try again.')
    }
    setIsLoading(false)
    setTimeout(() => {
      addBotMessage('Is there anything else I can help you with?', [
        { id: 'menu', text: '🏠 Back to Main Menu', value: 'main_menu' }
      ])
    }, 2000)
  }

  const handleLocationCheck = async (location) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/location/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.distance <= 100) {
          addBotMessage(`✅ Distance: ${result.distance}m from AIIMS Bhopal.\n🎫 Your token is now generated: ${result.tokenNumber}.`)
        } else {
          addBotMessage(`📍 Distance: ${result.distance}m from AIIMS Bhopal.\nPlease move closer to the hospital to generate your token.`)
        }
      } else {
        addBotMessage('❌ Unable to check location. Please try again.')
      }
    } catch (error) {
      addBotMessage('❌ Location check failed. Please try again.')
    }
    setIsLoading(false)
    setCurrentFlow(null)
    setTimeout(() => {
      addBotMessage('Is there anything else I can help you with?', [
        { id: 'menu', text: '🏠 Back to Main Menu', value: 'main_menu' }
      ])
    }, 2000)
  }

  const handleHelp = () => {
    addBotMessage('❓ Frequently Asked Questions:', [
      { id: 'timings', text: '1️⃣ Hospital timings?', value: 'timings' },
      { id: 'documents', text: '2️⃣ Required documents?', value: 'documents' },
      { id: 'reschedule', text: '3️⃣ Reschedule appointment?', value: 'reschedule' },
      { id: 'emergency', text: '4️⃣ Emergency contact?', value: 'emergency' }
    ])
  }

  const handleFAQ = (faq) => {
    switch(faq) {
      case 'timings':
        addBotMessage('🕐 Hospital Timings:\n• OPD: 8:00 AM - 6:00 PM\n• Emergency: 24/7\n• Lab Services: 7:00 AM - 8:00 PM')
        break
      case 'documents':
        addBotMessage('📄 Required Documents:\n• Valid ID Proof (Aadhar/PAN/Driving License)\n• Previous medical records (if any)\n• Insurance card (if applicable)')
        break
      case 'reschedule':
        addBotMessage('📅 To reschedule your appointment:\n• Contact us at (555) 123-4567\n• Visit the reception desk\n• Use the patient portal online')
        break
      case 'emergency':
        addBotMessage('🚨 Emergency Contact:\n• Emergency Line: (555) 911-HELP\n• Ambulance: (555) 111-AMBU\n• Main Hospital: (555) 123-4567')
        break
    }
    setTimeout(() => {
      addBotMessage('Is there anything else I can help you with?', [
        { id: 'menu', text: '🏠 Back to Main Menu', value: 'main_menu' }
      ])
    }, 2000)
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          addUserMessage(`📍 Location shared: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`)
          handleLocationCheck(location)
        },
        (error) => {
          addBotMessage('❌ Unable to get your location. Please enable location services or enter manually.')
        }
      )
    } else {
      addBotMessage('❌ Geolocation is not supported by this browser.')
    }
  }

  const handleInput = (value) => {
    if (!value.trim()) return
    
    addUserMessage(value)
    setInputValue('')
    
    switch(currentFlow) {
      case 'register':
        handleRegistrationFlow(value)
        break
      case 'token':
        handleTokenLookup(value)
        break
      case 'appointment':
        handleAppointmentLookup(value)
        break
      case 'location':
        // Handle manual location input
        const coords = value.split(',').map(c => parseFloat(c.trim()))
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          handleLocationCheck({ latitude: coords[0], longitude: coords[1] })
        } else {
          addBotMessage('❌ Please enter location in format: latitude, longitude (e.g., 23.2599, 77.4126)')
        }
        break
    }
  }

  const handleOptionClick = (option) => {
    if (option.value === 'main_menu') {
      setCurrentFlow(null)
      setRegistrationData({})
      addUserMessage('🏠 Back to Main Menu')
      addBotMessage('👋 Welcome back! Please choose an option:', [
        { id: 1, text: '1️⃣ Register as Patient', value: 'register' },
        { id: 2, text: '2️⃣ My Token Number', value: 'token' },
        { id: 3, text: '3️⃣ Appointment Time', value: 'appointment' },
        { id: 4, text: '4️⃣ Doctor & OPD Info', value: 'doctors' },
        { id: 5, text: '5️⃣ Hospital Location / Distance', value: 'location' },
        { id: 6, text: '6️⃣ Help / FAQs', value: 'help' }
      ])
      return
    }

    if (option.value === 'get_location') {
      getCurrentLocation()
      return
    }

    if (['timings', 'documents', 'reschedule', 'emergency'].includes(option.value)) {
      addUserMessage(option.text)
      handleFAQ(option.value)
      return
    }

    if (currentFlow === 'register' && ['Male', 'Female', 'Other', 'Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'General Medicine'].includes(option.value)) {
      addUserMessage(option.text)
      handleRegistrationFlow(option.value)
      return
    }

    // Handle main menu options
    handleMainMenuOption(option)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-50 p-0"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    )
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 bg-white shadow-2xl border-0 z-50 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-96'}`}>
      <CardHeader className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Patient Assistant
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-blue-700 p-1 h-8 w-8"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="p-0 h-64 overflow-y-auto bg-gray-50">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-xs p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : 'bg-white border shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.options && (
                      <div className="mt-3 space-y-2">
                        {message.options.map((option) => (
                          <Button
                            key={option.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleOptionClick(option)}
                            className="w-full justify-start text-xs p-2 h-auto"
                            disabled={isLoading}
                          >
                            {option.text}
                          </Button>
                        ))}
                      </div>
                    )}
                    {message.timestamp && (
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    )}
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border shadow-sm p-3 rounded-lg">
                    <p className="text-sm">Typing...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleInput(inputValue)}
                disabled={isLoading}
                className="flex-1 text-sm"
              />
              <Button
                size="sm"
                onClick={() => handleInput(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 p-2"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}