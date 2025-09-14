"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LocationTracker from "@/components/patient/LocationTracker";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Edit2, 
  Save, 
  X, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  MessageCircle, 
  Bell, 
  Heart, 
  Activity, 
  Mic, 
  Send, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  RefreshCw
} from "lucide-react";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [symptomInput, setSymptomInput] = useState("");
  const [showSymptomChat, setShowSymptomChat] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedHospitalName, setSelectedHospitalName] = useState("");
  const [showHospitalList, setShowHospitalList] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editAppointmentData, setEditAppointmentData] = useState({});
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "token",
      message: "Your token number is #A123 for Dr. Smith",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "appointment",
      message: "Appointment confirmed for tomorrow at 10:00 AM",
      time: "1 day ago",
      read: false,
    },
    {
      id: 3,
      type: "report",
      message: "Your blood test report is ready",
      time: "3 hours ago",
      read: true,
    },
  ]);

  useEffect(() => {
    // Get patient data from localStorage or redirect to login
    const storedData = localStorage.getItem("patientData");
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setPatientData(data);
        setEditForm(data);
      } catch (error) {
        console.error("Error parsing patient data:", error);
        window.location.href = "/patient/login";
      }
    } else {
      window.location.href = "/patient/login";
    }
    setLoading(false);
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updatePatient",
          mobileNumber: patientData.mobileNumber,
          patientData: editForm,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPatientData(editForm);
        localStorage.setItem("patientData", JSON.stringify(editForm));
        setEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPatientEdit = () => {
    setEditForm(patientData);
    setEditing(false);
  };

  const updateEditForm = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Mock data for other sections
  const currentToken = {
    number: "A-042",
    department: "Cardiology",
    doctor: "Dr. Sarah Johnson",
    expectedTime: "10:30 AM",
    status: "active",
  };

  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: 1,
      date: "2024-01-15",
      time: "2:00 PM",
      department: "Dermatology",
      doctor: "Dr. Michael Chen",
      hospital: "City General Hospital",
      status: "confirmed",
    },
    {
      id: 2,
      date: "2024-01-20",
      time: "11:00 AM",
      department: "Orthopedics",
      doctor: "Dr. Emily Rodriguez",
      hospital: "Metro Medical Center",
      status: "pending",
    },
  ]);

  const [medicalRecords, setMedicalRecords] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [hasCompletedPrescription, setHasCompletedPrescription] = useState(false)
  const [prescriptionCompleted, setPrescriptionCompleted] = useState(false)

  const fetchMedicalHistory = async () => {
    if (!patientData?.patientId) return
    
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/patients/history?patientId=${encodeURIComponent(patientData.patientId)}`)
      const data = await response.json()
      
      if (data.success) {
        const records = data.prescriptions.map(prescription => ({
          id: prescription._id,
          date: new Date(prescription.createdAt).toISOString().split('T')[0],
          department: prescription.department,
          doctor: prescription.doctorName,
          diagnosis: prescription.prescription.diagnosis,
          prescription: prescription.prescription.medicines.map(med => `${med.name} ${med.dosage} - ${med.duration}`).join(', '),
          symptoms: prescription.prescription.symptoms,
          notes: prescription.prescription.notes,
          tokenNumber: prescription.tokenNumber
        }))
        setMedicalRecords(records)
        
        // Check if patient has any completed prescriptions (prescription saved by doctor)
        const hasPrescription = records.length > 0
        setHasCompletedPrescription(hasPrescription)
        setPrescriptionCompleted(hasPrescription)
      }
    } catch (error) {
      console.error('Failed to fetch medical history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchMedicalHistory()
  }, [patientData])

  // Function to generate token for appointment
  const generateToken = (appointment) => {
    const tokenNumber = `#${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 900) + 100}`;
    
    const tokenNotification = {
      id: Date.now() + 4,
      type: "token",
      message: `Your token ${tokenNumber} has been generated for ${appointment.department} appointment`,
      time: "Just now",
      read: false,
    };
    
    setNotifications(prev => [tokenNotification, ...prev]);
    alert(`Token Generated: ${tokenNumber} for your ${appointment.department} appointment`);
  };

  const handleBookAppointment = () => {
    // Validate all required fields
    if (!cityInput.trim()) {
      alert("Please enter a city name");
      return;
    }
    
    if (!selectedHospital) {
      alert("Please select a hospital");
      return;
    }
    
    if (!selectedDepartment) {
      alert("Please select a department");
      return;
    }
    
    if (!preferredDate) {
      alert("Please select a preferred date");
      return;
    }

    // Create new appointment
    const newAppointment = {
      id: Date.now(),
      date: preferredDate,
      time: "10:00 AM", // Default time - could be enhanced with time selection
      department: selectedDepartment.split(' – ')[0], // Extract department name
      doctor: "Dr. TBD", // To be assigned
      hospital: selectedHospitalName,
      status: "pending",
    };

    // Add to upcoming appointments
    setUpcomingAppointments(prev => [newAppointment, ...prev]);

    // Add notification for new appointment
    const newNotification = {
      id: Date.now() + 1,
      type: "appointment",
      message: `New appointment booked for ${selectedDepartment.split(' – ')[0]} on ${preferredDate}`,
      time: "Just now",
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Clear form
    setCityInput("");
    setSelectedHospital("");
    setSelectedHospitalName("");
    setSelectedDepartment("");
    setPreferredDate("");
    setShowHospitalList(false);

    alert("Appointment booked successfully! Check your upcoming appointments.");
  };

  const handleDeleteAppointment = (appointmentId) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      const appointmentToDelete = upcomingAppointments.find(apt => apt.id === appointmentId);
      setUpcomingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      // Add notification for appointment deletion
      const deleteNotification = {
        id: Date.now() + 3,
        type: "appointment",
        message: `Appointment for ${appointmentToDelete?.department} on ${appointmentToDelete?.date} has been cancelled`,
        time: "Just now",
        read: false,
      };
      setNotifications(prev => [deleteNotification, ...prev]);
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment.id);
    setEditAppointmentData({
      department: appointment.department,
      date: appointment.date,
      time: appointment.time
    });
  };

  const handleSaveEditAppointment = () => {
    if (!editAppointmentData.department || !editAppointmentData.date || !editAppointmentData.time) {
      alert("Please fill all required fields");
      return;
    }

    setUpcomingAppointments(prev => 
      prev.map(apt => 
        apt.id === editingAppointment 
          ? { ...apt, ...editAppointmentData }
          : apt
      )
    );
    
    // Add notification for appointment update
    const updateNotification = {
      id: Date.now() + 2,
      type: "appointment",
      message: `Appointment updated for ${editAppointmentData.department} on ${editAppointmentData.date}`,
      time: "Just now",
      read: false,
    };
    setNotifications(prev => [updateNotification, ...prev]);
    
    setEditingAppointment(null);
    setEditAppointmentData({});
    alert("Appointment updated successfully!");
  };

  const handleCancelAppointmentEdit = () => {
    setEditingAppointment(null);
    setEditAppointmentData({});
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotificationDropdown && !event.target.closest('.notification-dropdown')) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationDropdown]);

  const handleSymptomSubmit = () => {
    if (symptomInput.trim()) {
      setShowSymptomChat(true);
      // Simulate AI response
      setTimeout(() => {
        // Add AI response to chat
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">
            Patient data not found. Please login again.
          </p>
          <Button
            onClick={() => (window.location.href = "/patient/login")}
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  };

  const fetchHospitalsByCity = async (city) => {
    if (!city.trim()) {
      setHospitals([]);
      return;
    }

    setLoadingHospitals(true);
    try {
      const response = await fetch(
        `/api/places?city=${encodeURIComponent(city)}`
      );
      const data = await response.json();

      if (data.success) {
        setHospitals(data.hospitals);
      } else {
        console.error("Failed to fetch hospitals:", data.error);
        setHospitals([]);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      setHospitals([]);
    } finally {
      setLoadingHospitals(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 min-h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  Patient Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-700 truncate">
                  Welcome back, {patientData.fullName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative p-2 text-gray-700 hover:text-gray-900"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div className="notification-dropdown absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="p-2">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border-l-4 mb-2 ${
                              notification.type === "token"
                                ? "border-purple-500 bg-purple-50"
                                : notification.type === "appointment"
                                ? "border-blue-500 bg-blue-50"
                                : "border-green-500 bg-green-50"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200">
                        <button 
                          onClick={() => {
                            setNotifications(prev => prev.map(n => ({...n, read: true})));
                            setShowNotificationDropdown(false);
                          }}
                          className="w-full text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab("profile")}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === "profile" ? (
          /* Profile View */
          <div className="max-w-2xl mx-auto">
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    My Profile
                  </div>
                  <div className="flex gap-2">
                    {!editing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("dashboard")}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Back to Dashboard
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.fullName || ""}
                            onChange={(e) =>
                              updateEditForm("fullName", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.dateOfBirth || ""}
                            onChange={(e) =>
                              updateEditForm("dateOfBirth", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Age
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            value={editForm.age || ""}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.gender || ""}
                            onChange={(e) =>
                              updateEditForm("gender", e.target.value)
                            }
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Blood Group
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.bloodGroup || ""}
                            onChange={(e) =>
                              updateEditForm("bloodGroup", e.target.value)
                            }
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Marital Status
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.maritalStatus || ""}
                            onChange={(e) =>
                              updateEditForm("maritalStatus", e.target.value)
                            }
                          >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile Number
                          </label>
                          <input
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            value={editForm.mobileNumber || ""}
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">Mobile number cannot be changed</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email ID
                          </label>
                          <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.email || ""}
                            onChange={(e) =>
                              updateEditForm("email", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Emergency Contact Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.emergencyContactName || ""}
                            onChange={(e) =>
                              updateEditForm("emergencyContactName", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Emergency Contact Phone
                          </label>
                          <input
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.emergencyContactPhone || ""}
                            onChange={(e) =>
                              updateEditForm("emergencyContactPhone", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Address Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            House No
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.houseNo || ""}
                            onChange={(e) =>
                              updateEditForm("houseNo", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.city || ""}
                            onChange={(e) =>
                              updateEditForm("city", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.state || ""}
                            onChange={(e) =>
                              updateEditForm("state", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.pincode || ""}
                            onChange={(e) =>
                              updateEditForm("pincode", e.target.value)
                            }
                            maxLength="6"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Complete Address
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={editForm.address || ""}
                          onChange={(e) =>
                            updateEditForm("address", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Medical Information */}
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Medical Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Existing Medical Conditions
                          </label>
                          <textarea
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.existingConditions || ""}
                            onChange={(e) =>
                              updateEditForm("existingConditions", e.target.value)
                            }
                            placeholder="e.g., Diabetes, Hypertension, Heart Disease"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Known Allergies
                          </label>
                          <textarea
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.allergies || ""}
                            onChange={(e) =>
                              updateEditForm("allergies", e.target.value)
                            }
                            placeholder="Food allergies, drug allergies, etc."
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Medications
                            </label>
                            <textarea
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={editForm.currentMedications || ""}
                              onChange={(e) =>
                                updateEditForm("currentMedications", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Payment Method Preference
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={editForm.paymentMethod || ""}
                              onChange={(e) =>
                                updateEditForm("paymentMethod", e.target.value)
                              }
                            >
                              <option value="">Select Payment Method</option>
                              <option value="Cash">Cash</option>
                              <option value="Card">Card (Credit/Debit)</option>
                              <option value="UPI">UPI</option>
                              <option value="Insurance">Insurance</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4">
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
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelPatientEdit}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <User className="w-12 h-12 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {patientData.fullName}
                      </h2>
                      <p className="text-gray-600">Patient ID: {patientData.id || 'Not assigned'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                            <span className="text-gray-700">
                              Age: {patientData.age} years
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 mr-3 text-gray-500" />
                            <span className="text-gray-700">
                              Gender: {patientData.gender}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-3 text-gray-500" />
                            <span className="text-gray-700">
                              +91 {patientData.mobileNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">Location Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-3 text-blue-500" />
                            <span className="text-gray-700">
                              City: {patientData.city}
                            </span>
                          </div>
                          <div className="flex items-start text-sm">
                            <MapPin className="w-4 h-4 mr-3 mt-0.5 text-green-500" />
                            <span className="text-gray-700">
                              Address: {patientData.address}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Dashboard View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Left Column - Main Dashboard */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-8">
              {/* Location Tracker */}
              <LocationTracker patientData={patientData} prescriptionCompleted={prescriptionCompleted} />

            {/* Visit Again Card - Show when prescription is completed */}
            {prescriptionCompleted ? (
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl text-gray-900">
                    <Heart className="w-5 h-5 mr-2 text-pink-600" />
                    Visit Again & Stay Healthy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-6 text-white">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold mb-2">
                        Thank You for Your Visit!
                      </h3>
                      <p className="text-pink-100 text-lg mb-4">
                        Your consultation has been completed successfully
                      </p>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span>Prescription saved and ready for collection</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <FileText className="w-4 h-4 mr-2" />
                          <span>Medical records updated in your profile</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <Star className="w-4 h-4 mr-2" />
                          <span>We hope you feel better soon!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-green-800">Book Follow-up</h4>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Schedule your next appointment for continued care
                      </p>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          // Scroll to appointment booking section
                          document.querySelector('[data-section="appointment-booking"]')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Book Follow-up
                      </Button>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Activity className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-800">Health Tips</h4>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Get personalized health recommendations
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          // Scroll to AI symptom checker
                          document.querySelector('[data-section="symptom-checker"]')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Get Tips
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      💊 Don't forget to take your prescribed medications as directed
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Expected Time to Meet Doctor Card - Show when no prescription completed */
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl text-gray-900">
                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                    Expected Time to Meet Doctor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2">
                        {new Date(Date.now() + (Math.floor(Math.random() * 30) + 15) * 60000).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </div>
                      <p className="text-purple-100 text-lg mb-4">
                        Estimated appointment time
                      </p>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 mr-2" />
                          <span className="font-semibold">
                            {patientData?.specializedDoctor || 'Dr. Sarah Johnson'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span>Token: {patientData?.tokenNumber || 'A-042'}</span>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-purple-100">
                        Approximate wait time: {Math.floor(Math.random() * 30) + 15} minutes
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Please be present 10 minutes before your expected time.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appointment Booking Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl" data-section="appointment-booking">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Book New Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter city name *"
                        value={cityInput}
                        onChange={(e) => {
                          setCityInput(e.target.value);
                          fetchHospitalsByCity(e.target.value);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital *
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowHospitalList(!showHospitalList)}
                          disabled={loadingHospitals || hospitals.length === 0}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left bg-white flex items-center justify-between"
                        >
                          <span className={selectedHospitalName ? "text-gray-900" : "text-gray-500"}>
                            {loadingHospitals
                              ? "Loading hospitals..."
                              : hospitals.length === 0
                              ? "Enter city to see hospitals"
                              : selectedHospitalName || "Select Hospital"}
                          </span>
                          <svg className={`w-5 h-5 transition-transform ${showHospitalList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {showHospitalList && hospitals.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {hospitals.map((hospital) => (
                              <button
                                key={hospital.id}
                                type="button"
                                onClick={() => {
                                  setSelectedHospital(hospital.id);
                                  setSelectedHospitalName(hospital.name);
                                  setShowHospitalList(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">{hospital.name}</div>
                                <div className="text-sm text-gray-600">{hospital.address}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <select 
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Department *</option>
                        <option key="general-medicine" value="General Medicine (Physician) – fever, BP, diabetes, general illness">General Medicine (Physician) – fever, BP, diabetes, general illness</option>
                        <option key="general-surgery" value="General Surgery – minor operations, surgical issues">General Surgery – minor operations, surgical issues</option>
                        <option key="orthopedics" value="Orthopedics – bones, fractures, back pain, joints">Orthopedics – bones, fractures, back pain, joints</option>
                        <option key="cardiology" value="Cardiology – heart, chest pain, BP issues">Cardiology – heart, chest pain, BP issues</option>
                        <option key="neurology" value="Neurology – headache, stroke, epilepsy, nerve problems">Neurology – headache, stroke, epilepsy, nerve problems</option>
                        <option key="ent" value="ENT (Ear, Nose, Throat) – ear pain, throat infection, sinus">ENT (Ear, Nose, Throat) – ear pain, throat infection, sinus</option>
                        <option key="ophthalmology" value="Ophthalmology (Eye) – eye checkup, vision problems">Ophthalmology (Eye) – eye checkup, vision problems</option>
                        <option key="dermatology" value="Dermatology (Skin) – skin, hair, nail issues">Dermatology (Skin) – skin, hair, nail issues</option>
                        <option key="gynecology" value="Gynecology & Obstetrics (Women's health) – pregnancy, periods, fertility">Gynecology & Obstetrics (Women's health) – pregnancy, periods, fertility</option>
                        <option key="pediatrics" value="Pediatrics – child health, vaccinations">Pediatrics – child health, vaccinations</option>
                        <option key="psychiatry" value="Psychiatry – mental health, stress, depression">Psychiatry – mental health, stress, depression</option>
                        <option key="dentistry" value="Dentistry – teeth, gums, oral care">Dentistry – teeth, gums, oral care</option>
                        <option key="pulmonology" value="Pulmonology (Chest/Respiratory) – cough, asthma, breathing problems">Pulmonology (Chest/Respiratory) – cough, asthma, breathing problems</option>
                        <option key="gastroenterology" value="Gastroenterology – stomach, liver, digestion issues">Gastroenterology – stomach, liver, digestion issues</option>
                        <option key="nephrology" value="Nephrology – kidney, urine problems">Nephrology – kidney, urine problems</option>
                        <option key="urology" value="Urology – urinary & male reproductive health">Urology – urinary & male reproductive health</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
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
                  {loadingHistory ? (
                    <div className="text-center py-6">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Loading medical history...</p>
                    </div>
                  ) : medicalRecords.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No medical records found</p>
                      <p className="text-sm">Your prescriptions will appear here after doctor consultations</p>
                    </div>
                  ) : (
                    medicalRecords.map((record, index) => (
                      <div
                        key={record.id || `record-${index}`}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {record.department}
                            </h4>
                            <p className="text-sm text-gray-700">
                              {record.doctor}
                            </p>
                            {record.tokenNumber && (
                              <p className="text-xs text-blue-600 font-mono">
                                Token: {record.tokenNumber}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {record.date}
                          </span>
                        </div>
                        {record.symptoms && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-800">
                              <span className="font-medium">Symptoms:</span>{" "}
                              {record.symptoms}
                            </p>
                          </div>
                        )}
                        <div className="mb-2">
                          <p className="text-sm text-gray-800">
                            <span className="font-medium">Diagnosis:</span>{" "}
                            {record.diagnosis}
                          </p>
                        </div>
                        {record.prescription && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-800">
                              <span className="font-medium">Prescription:</span>{" "}
                              {record.prescription}
                            </p>
                          </div>
                        )}
                        {record.notes && (
                          <div className="text-sm text-gray-800">
                            <span className="font-medium">Notes:</span>{" "}
                            {record.notes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {medicalRecords.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={fetchMedicalHistory}
                      disabled={loadingHistory}
                    >
                      {loadingHistory ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Refresh Records
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4 lg:space-y-8">
            {/* AI Symptom Checker Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl" data-section="symptom-checker">
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
                        Based on your symptoms, I recommend consulting a{" "}
                        {symptomInput.includes("chest")
                          ? "cardiologist"
                          : "general physician"}
                        . This is not a medical diagnosis - please consult a
                        healthcare professional.
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
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.fullName || ""}
                        onChange={(e) =>
                          updateEditForm("fullName", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.age || ""}
                        onChange={(e) => updateEditForm("age", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.gender || ""}
                        onChange={(e) =>
                          updateEditForm("gender", e.target.value)
                        }
                      >
                        <option value="">Select Gender</option>
                        <option key="male" value="male">Male</option>
                        <option key="female" value="female">Female</option>
                        <option key="other" value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.city || ""}
                        onChange={(e) =>
                          updateEditForm("city", e.target.value)
                        }
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm.address || ""}
                        onChange={(e) =>
                          updateEditForm("address", e.target.value)
                        }
                        placeholder="Enter your full address"
                      />
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
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelPatientEdit}
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
                      <h3 className="font-semibold text-gray-900">
                        {patientData.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Patient ID: P-{patientData.mobileNumber.slice(-4)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-gray-700">
                          Age: {patientData.age} years
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-gray-700">
                          Gender: {patientData.gender}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">
                          +91 {patientData.mobileNumber}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-gray-700">
                          City: {patientData.city}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-gray-700">
                          Address: {patientData.address}
                        </span>
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
                  {(showAllNotifications ? notifications : notifications.slice(0, 3)).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        notification.type === "token"
                          ? "border-purple-500 bg-purple-50"
                          : notification.type === "appointment"
                          ? "border-blue-500 bg-blue-50"
                          : "border-green-500 bg-green-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {notifications.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowAllNotifications(!showAllNotifications)}
                    >
                      {showAllNotifications ? 'Show Less' : `View All (${notifications.length})`}
                      <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${showAllNotifications ? 'rotate-90' : ''}`} />
                    </Button>
                  )}
                  
                  {notifications.length <= 3 && notifications.length > 0 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  
                  {notifications.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No notifications</p>
                      <p className="text-sm">You're all caught up!</p>
                    </div>
                  )}
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
                  {(showAllAppointments ? upcomingAppointments : upcomingAppointments.slice(0, 3)).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      {editingAppointment === appointment.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                            <input
                              type="text"
                              value={editAppointmentData.department}
                              onChange={(e) => setEditAppointmentData(prev => ({...prev, department: e.target.value}))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                              <input
                                type="date"
                                value={editAppointmentData.date}
                                onChange={(e) => setEditAppointmentData(prev => ({...prev, date: e.target.value}))}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                              <input
                                type="time"
                                value={editAppointmentData.time}
                                onChange={(e) => setEditAppointmentData(prev => ({...prev, time: e.target.value}))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={handleSaveEditAppointment}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={handleCancelAppointmentEdit}
                              variant="outline"
                              className="flex-1 text-sm py-2"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {appointment.department}
                              </h4>
                              <p className="text-sm text-gray-700">
                                {appointment.doctor}
                              </p>
                              {appointment.hospital && (
                                <p className="text-xs text-gray-600">
                                  {appointment.hospital}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  appointment.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {appointment.status}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => handleEditAppointment(appointment)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-800">
                            <Calendar className="w-4 h-4 mr-1" />
                            {appointment.date} at {appointment.time}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {upcomingAppointments.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowAllAppointments(!showAllAppointments)}
                    >
                      {showAllAppointments ? 'Show Less' : `View All (${upcomingAppointments.length})`}
                      <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${showAllAppointments ? 'rotate-90' : ''}`} />
                    </Button>
                  )}
                  
                  {upcomingAppointments.length <= 3 && upcomingAppointments.length > 0 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      {upcomingAppointments.length} appointment{upcomingAppointments.length !== 1 ? 's' : ''} scheduled
                    </div>
                  )}
                  
                  {upcomingAppointments.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No upcoming appointments</p>
                      <p className="text-sm">Book your first appointment above</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
