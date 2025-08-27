"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Search, 
  User, 
  Stethoscope, 
  FileText, 
  BarChart3, 
  Settings, 
  Bell, 
  Plus,
  Minus,
  Save,
  Clock,
  Heart,
  AlertTriangle,
  MapPin,
  Phone,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Pill,
  Clipboard,
  Eye,
  Edit
} from "lucide-react"

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [tokenInput, setTokenInput] = useState("")
  const [currentPatient, setCurrentPatient] = useState(null)
  const [prescriptionForm, setPrescriptionForm] = useState({
    symptoms: "",
    diagnosis: "",
    medicines: [{ name: "", dosage: "", duration: "" }],
    notes: ""
  })
  const [showAnalytics, setShowAnalytics] = useState(true)

  // Mock patient data
  const mockPatient = {
    id: "P-001234",
    name: "John Doe",
    age: 35,
    gender: "Male",
    bloodGroup: "O+",
    allergies: "Penicillin, Nuts",
    medicalHistory: "Hypertension (2020), Diabetes Type 2 (2021)",
    problemDescription: "Severe headache and fever for the past 3 days",
    contact: "+91 98765 43210",
    address: "123 Healthcare Avenue, Mumbai, Maharashtra"
  }

  // Mock analytics data
  const analyticsData = {
    today: 12,
    yesterday: 15,
    thisWeek: 89,
    thisMonth: 342,
    diseaseDistribution: [
      { name: "Fever", count: 45, percentage: 25 },
      { name: "Cold", count: 38, percentage: 21 },
      { name: "Diabetes", count: 32, percentage: 18 },
      { name: "Hypertension", count: 28, percentage: 16 },
      { name: "Others", count: 35, percentage: 20 }
    ]
  }

  // Mock patient records
  const patientRecords = [
    {
      tokenId: "A-001",
      patientName: "Sarah Johnson",
      age: 28,
      date: "2024-01-15",
      diagnosis: "Upper Respiratory Infection",
      prescriptionStatus: "Completed"
    },
    {
      tokenId: "A-002",
      patientName: "Michael Chen",
      age: 42,
      date: "2024-01-15",
      diagnosis: "Hypertension",
      prescriptionStatus: "Completed"
    },
    {
      tokenId: "A-003",
      patientName: "Emily Rodriguez",
      age: 31,
      date: "2024-01-14",
      diagnosis: "Migraine",
      prescriptionStatus: "Completed"
    }
  ]

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      // Simulate patient lookup
      setTimeout(() => {
        setCurrentPatient(mockPatient)
      }, 500)
    }
  }

  const addMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", duration: "" }]
    }))
  }

  const removeMedicine = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }))
  }

  const updateMedicine = (index, field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  const handleSavePrescription = () => {
    // Save prescription logic
    console.log("Prescription saved:", prescriptionForm)
    alert("Prescription saved successfully!")
    
    // Reset form
    setPrescriptionForm({
      symptoms: "",
      diagnosis: "",
      medicines: [{ name: "", dosage: "", duration: "" }],
      notes: ""
    })
    setCurrentPatient(null)
    setTokenInput("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-sm text-gray-600">Dr. Sarah Johnson • Cardiology</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "dashboard" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("patients")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "patients" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Patients</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "reports" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Reports</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "settings" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Token Input Section */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Search className="w-5 h-5 mr-2 text-blue-600" />
                  Patient Token Lookup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Enter Patient Token (e.g., A-042)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                  />
                  <Button 
                    onClick={handleTokenSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Lookup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Patient Details Section */}
            {currentPatient && (
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <User className="w-5 h-5 mr-2 text-green-600" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentPatient.name}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Age:</span> {currentPatient.age} years
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Gender:</span> {currentPatient.gender}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Blood Group:</span> {currentPatient.bloodGroup}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Patient ID:</span> {currentPatient.id}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                            {currentPatient.contact}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            {currentPatient.address}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Medical Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Allergies:</span>
                            <span className="text-red-600 ml-2">{currentPatient.allergies || "None"}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Medical History:</span>
                            <p className="text-gray-600 mt-1">{currentPatient.medicalHistory || "No significant history"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Current Problem</h4>
                        <p className="text-gray-600 text-sm">{currentPatient.problemDescription}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prescription Form Section */}
            {currentPatient && (
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Clipboard className="w-5 h-5 mr-2 text-purple-600" />
                    Write Prescription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                        <textarea
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe patient symptoms..."
                          value={prescriptionForm.symptoms}
                          onChange={(e) => setPrescriptionForm(prev => ({ ...prev, symptoms: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                        <textarea
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter diagnosis..."
                          value={prescriptionForm.diagnosis}
                          onChange={(e) => setPrescriptionForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">Prescribed Medicines</label>
                        <Button
                          type="button"
                          onClick={addMedicine}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Medicine
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {prescriptionForm.medicines.map((medicine, index) => (
                          <div key={index} className="grid md:grid-cols-4 gap-3 items-center">
                            <input
                              type="text"
                              placeholder="Medicine name"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={medicine.name}
                              onChange={(e) => updateMedicine(index, "name", e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Dosage"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={medicine.dosage}
                              onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Duration"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={medicine.duration}
                              onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                            />
                            <Button
                              type="button"
                              onClick={() => removeMedicine(index)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any additional instructions or notes..."
                        value={prescriptionForm.notes}
                        onChange={(e) => setPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSavePrescription}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Save Prescription
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Analytics Section */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                    Analytics & Insights
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    {showAnalytics ? "Hide" : "Show"} Analytics
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAnalytics && (
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{analyticsData.today}</div>
                        <div className="text-sm text-blue-700">Today</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{analyticsData.yesterday}</div>
                        <div className="text-sm text-green-700">Yesterday</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{analyticsData.thisWeek}</div>
                        <div className="text-sm text-purple-700">This Week</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{analyticsData.thisMonth}</div>
                        <div className="text-sm text-orange-700">This Month</div>
                      </div>
                    </div>

                    {/* Disease Distribution Chart */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-4">Disease Distribution</h4>
                      <div className="space-y-3">
                        {analyticsData.diseaseDistribution.map((disease, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${
                                index === 0 ? 'bg-blue-500' :
                                index === 1 ? 'bg-green-500' :
                                index === 2 ? 'bg-purple-500' :
                                index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                              }`}></div>
                              <span className="text-sm font-medium text-gray-700">{disease.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    index === 0 ? 'bg-blue-500' :
                                    index === 1 ? 'bg-green-500' :
                                    index === 2 ? 'bg-purple-500' :
                                    index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                                  }`}
                                  style={{ width: `${disease.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">{disease.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient Records Table */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" />
                  Patient Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Token ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Patient Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Age</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Diagnosis</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientRecords.map((record, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-mono text-blue-600">{record.tokenId}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{record.patientName}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{record.age}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{record.date}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{record.diagnosis}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {record.prescriptionStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button className="p-1 text-blue-600 hover:text-blue-700">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-green-600 hover:text-green-700">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

