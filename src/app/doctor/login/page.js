"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  User, 
  Stethoscope, 
  Shield, 
  ArrowRight,
  CheckCircle
} from "lucide-react"

export default function DoctorLoginPage() {
  const [doctorId, setDoctorId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!doctorId.trim()) {
      setError("Please enter your Doctor ID")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: doctorId.trim() })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Store doctor info in localStorage for session
        localStorage.setItem('doctorInfo', JSON.stringify(data.doctor))
        // Redirect to doctor dashboard
        window.location.href = "/doctor/dashboard"
      } else {
        setError(data.message || "Login failed")
      }
    } catch (error) {
      console.error('Login error:', error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        {/* Left Side - Illustration & Branding */}
        <div className="text-center lg:text-left">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome <span className="text-blue-600">Doctor</span>
            </h1>
            <p className="text-xl text-gray-800 mb-6">
              Access your patient management dashboard and provide exceptional care with our smart hospital system.
            </p>
          </div>
          
          {/* Doctor Illustration */}
          <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8 mb-6">
            <div className="w-32 h-32 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Stethoscope className="w-16 h-16 text-blue-600" />
            </div>
            <p className="text-blue-800 font-medium">Professional Healthcare</p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Quick patient token lookup</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Digital prescription management</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Analytics and insights</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Doctor Login</h2>
              <p className="text-gray-700">Enter your Doctor ID to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor ID
                </label>
                <input
                  type="text"
                  placeholder="Enter your unique Doctor ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono text-gray-900 placeholder:text-gray-400"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Format: DR-XXXXX (e.g., DR-00123)
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm text-center">{error}</p>
                </div>
              )}

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2" />
                    Access Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Secure access to patient management system
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

