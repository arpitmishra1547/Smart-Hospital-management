"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { sendOtpToPhone } from "@/lib/firebase"
import { 
  Phone, 
  User, 
  ArrowLeft,
  CheckCircle,
  Loader2
} from "lucide-react"

export default function PatientLoginPage() {
  const [step, setStep] = useState("login") // login, otp
  const [mobileNumber, setMobileNumber] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const confirmationRef = useRef(null)
  const [loading, setLoading] = useState(false)


  const handleSendOTP = async () => {
    if (mobileNumber.length !== 10) return
    const phone = `+91${mobileNumber}`
    try {
      setLoading(true)
      const result = await sendOtpToPhone(phone)
      confirmationRef.current = result
      setStep("otp")
    } catch (err) {
      alert(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (index, value) => {
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const code = otp.join("")
    if (code.length !== 6 || !confirmationRef.current) return
    
    setLoading(true)
    try {
      await confirmationRef.current.confirm(code)
      
      // Check if patient exists in MongoDB
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'checkMobile',
          mobileNumber: mobileNumber
        })
      });

      const result = await response.json();
      
      if (result.exists) {
        // Patient exists, redirect to dashboard with data
        localStorage.setItem('patientData', JSON.stringify(result.patient));
        window.location.href = "/patient/dashboard";
      } else {
        // New patient, redirect to comprehensive registration page
        // Store mobile number in localStorage for pre-filling
        localStorage.setItem('pendingMobileNumber', mobileNumber);
        window.location.href = "/patient/register";
      }
    } catch (err) {
      alert(err.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }



  if (step === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Side - Illustration & Branding */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to <span className="text-blue-600">SmartCare</span>
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Your health journey starts here. Quick, secure, and personalized care.
              </p>
            </div>
            
            {/* Doctor Illustration Placeholder */}
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8 mb-6">
              <div className="w-32 h-32 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-16 h-16 text-blue-600" />
              </div>
              <p className="text-blue-800 font-medium">Professional Healthcare</p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Patient Login</h2>
                <p className="text-gray-600">Enter your mobile number to continue</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg px-3 py-3 border-r-0">
                      <option>+91</option>
                      <option>+1</option>
                      <option>+44</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      maxLength={10}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSendOTP}
                  disabled={mobileNumber.length !== 10 || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending OTP...
                    </div>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Send OTP
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl max-w-md w-full mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">OTP Sent!</h2>
              <p className="text-gray-600">
                Enter the 6-digit OTP sent to <br />
                <span className="font-semibold">+91 {mobileNumber}</span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                  />
                ))}
              </div>

              <Button 
                onClick={handleVerifyOTP}
                disabled={otp.join("").length !== 6 || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive OTP?{" "}
                  <button className="text-blue-600 hover:underline font-medium">
                    Resend OTP
                  </button>
                </p>
              </div>

              <button
                onClick={() => setStep("login")}
                className="flex items-center justify-center w-full text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }



  return null
}

