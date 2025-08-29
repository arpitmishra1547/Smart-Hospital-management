"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  MessageCircle, 
  Bell, 
  Plus,
  MapPin,
  Phone,
  Heart,
  Activity,
  Mic,
  Send,
  ChevronRight,
  Star,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  Loader2
} from "lucide-react"

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [symptomInput, setSymptomInput] = useState("")
  const [showSymptomChat, setShowSymptomChat] = useState(false)
  const [patientData, setPatientData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Get patient data from localStorage or redirect to login
    const storedData = localStorage.getItem('patientData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setPatientData(data)
        setEditForm(data)
      } catch (error) {
        console.error('Error parsing patient data:', error)
        window.location.href = "/patient/login"
      }
    } else {
      window.location.href = "/patient/login"
    }
    setLoading(false)
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updatePatient',
          mobileNumber: patientData.mobileNumber,
          patientData: editForm
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setPatientData(editForm)
        localStorage.setItem('patientData', JSON.stringify(editForm))
        setEditing(false)
        alert("Profile updated successfully!")
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error('Update error:', error);
      alert("Failed to update profile");
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditForm(patientData)
    setEditing(false)
  }

  const updateEditForm = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  // Mock data for other sections
  const currentToken = {
    number: "A-042",
    department: "Cardiology",
    doctor: "Dr. Sarah Johnson",
    expectedTime: "10:30 AM",
    status: "active"
  }

  const upcomingAppointments = [
    {
      id: 1,
      date: "2024-01-15",
      time: "2:00 PM",
      department: "Dermatology",
      doctor: "Dr. Michael Chen",
      status: "confirmed"
    },
    {
      id: 2,
      date: "2024-01-20",
      time: "11:00 AM",
      department: "Orthopedics",
      doctor: "Dr. Emily Rodriguez",
      status: "pending"
    }
  ]

  const medicalRecords = [
    {
      id: 1,
      date: "2024-01-10",
      department: "General Medicine",
      doctor: "Dr. James Wilson",
      diagnosis: "Upper Respiratory Infection",
      prescription: "Azithromycin 500mg, Paracetamol 500mg"
    },
    {
      id: 2,
      date: "2024-01-05",
      department: "Cardiology",
      doctor: "Dr. Sarah Johnson",
      diagnosis: "Hypertension",
      prescription: "Amlodipine 5mg, Losartan 50mg"
    }
  ]

  const notifications = [
    {
      id: 1,
      type: "token",
      message: "Your token A-042 is next in line",
      time: "2 min ago",
      read: false
    },
    {
      id: 2,
      type: "appointment",
      message: "Appointment confirmed with Dr. Chen on Jan 15",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      type: "report",
      message: "Your blood test report is ready",
      time: "3 hours ago",
      read: true
    }
  ]

  const handleBookAppointment = () => {
    // Navigate to appointment booking
    console.log("Navigate to appointment booking")
  }

  const handleSymptomSubmit = () => {
    if (symptomInput.trim()) {
      setShowSymptomChat(true)
      // Simulate AI response
      setTimeout(() => {
        // Add AI response to chat
      }, 1000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Patient data not found. Please login again.</p>
          <Button 
            onClick={() => window.location.href = "/patient/login"}
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Patient Dashboard</h1>
                <p className="text-sm text-gray-700">Welcome back, {patientData.fullName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-700 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Dashboard */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Token Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Current Token
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-6 text-white">
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2">{currentToken.number}</div>
                    <p className="text-blue-100 text-lg mb-4">
                      {currentToken.department} • {currentToken.doctor}
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        <span className="font-semibold">Expected: {currentToken.expectedTime}</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Booking Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Book New Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Select Department</option>
                        <option>Cardiology</option>
                        <option>Dermatology</option>
                        <option>Orthopedics</option>
                        <option>General Medicine</option>
                        <option>Pediatrics</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleBookAppointment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Medical Records Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Recent Medical Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{record.department}</h4>
                          <p className="text-sm text-gray-700">{record.doctor}</p>
                        </div>
                        <span className="text-sm text-gray-500">{record.date}</span>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm text-gray-800"><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>
                      </div>
                      <div className="text-sm text-gray-800">
                        <span className="font-medium">Prescription:</span> {record.prescription}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Records
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* AI Symptom Checker Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <MessageCircle className="w-5 h-5 mr-2 text-indigo-600" />
                  AI Symptom Checker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Describe your symptoms..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                    />
                    <Button 
                      size="sm"
                      onClick={handleSymptomSubmit}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowSymptomChat(!showSymptomChat)}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Input
                  </Button>
                  
                  {showSymptomChat && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-indigo-800">
                        Based on your symptoms, I recommend consulting a {symptomInput.includes('chest') ? 'cardiologist' : 'general physician'}. 
                        This is not a medical diagnosis - please consult a healthcare professional.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Profile
                  </div>
                  {!editing && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.fullName || ''}
                        onChange={(e) => updateEditForm("fullName", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.age || ''}
                        onChange={(e) => updateEditForm("age", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.gender || ''}
                        onChange={(e) => updateEditForm("gender", e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Problem Description</label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.problemDescription || ''}
                        onChange={(e) => updateEditForm("problemDescription", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialized Doctor</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.specializedDoctor || ''}
                        onChange={(e) => updateEditForm("specializedDoctor", e.target.value)}
                      >
                        <option value="">Select Specialized Doctor</option>
                        <option value="Dr. Sarah Johnson - Cardiology">Dr. Sarah Johnson - Cardiology</option>
                        <option value="Dr. Michael Chen - Dermatology">Dr. Michael Chen - Dermatology</option>
                        <option value="Dr. Emily Rodriguez - Orthopedics">Dr. Emily Rodriguez - Orthopedics</option>
                        <option value="Dr. James Wilson - General Medicine">Dr. James Wilson - General Medicine</option>
                        <option value="Dr. Lisa Thompson - Pediatrics">Dr. Lisa Thompson - Pediatrics</option>
                        <option value="Dr. Robert Kim - Neurology">Dr. Robert Kim - Neurology</option>
                        <option value="Dr. Maria Garcia - Gynecology">Dr. Maria Garcia - Gynecology</option>
                        <option value="Dr. David Lee - Psychiatry">Dr. David Lee - Psychiatry</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <User className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{patientData.fullName}</h3>
                      <p className="text-sm text-gray-600">Patient ID: P-{patientData.mobileNumber.slice(-4)}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-gray-700">Age: {patientData.age} years</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-gray-700">Gender: {patientData.gender}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">+91 {patientData.mobileNumber}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Heart className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-gray-700">Problem: {patientData.problemDescription}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-gray-700">Doctor: {patientData.specializedDoctor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Bell className="w-5 h-5 mr-2 text-orange-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        notification.read 
                          ? 'bg-gray-50 border-gray-300' 
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <p className="text-sm text-gray-800 mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-700">{notification.time}</p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.department}</h4>
                          <p className="text-sm text-gray-700">{appointment.doctor}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-800">
                        <Calendar className="w-4 h-4 mr-1" />
                        {appointment.date} at {appointment.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

