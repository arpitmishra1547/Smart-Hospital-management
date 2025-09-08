import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const mobile = searchParams.get('mobile')
    
    if (!mobile) {
      return NextResponse.json({ 
        success: false, 
        message: 'Mobile number is required' 
      }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('hospital-management')
    
    // Find patient by mobile number
    const patientMobile = await db.collection('patients_mobileNumbers').findOne({ 
      mobileNumber: mobile 
    })
    
    if (!patientMobile) {
      return NextResponse.json({ 
        success: false, 
        message: 'Patient not found' 
      }, { status: 404 })
    }
    
    // Get patient profile
    const patient = await db.collection('patients_profile').findOne({ 
      patientId: patientMobile.patientId 
    })
    
    if (!patient) {
      return NextResponse.json({ 
        success: false, 
        message: 'Patient profile not found' 
      }, { status: 404 })
    }
    
    // Get today's schedule for the patient's department
    const today = new Date().toISOString().split('T')[0]
    const schedule = await db.collection('schedules').findOne({
      departmentId: patient.department,
      date: today,
      status: 'Active'
    })
    
    if (!schedule) {
      return NextResponse.json({ 
        success: false, 
        message: 'No appointment scheduled for today' 
      }, { status: 404 })
    }
    
    // Calculate estimated appointment time based on queue position
    const queuePosition = await db.collection('tokens').countDocuments({
      department: patient.department,
      date: today,
      tokenNumber: { $lt: patient.tokenNumber || 'Z999' },
      status: 'Active'
    })
    
    // Estimate 15 minutes per patient
    const appointmentTime = new Date(`${today}T${schedule.startTime}`)
    appointmentTime.setMinutes(appointmentTime.getMinutes() + (queuePosition * 15))
    
    return NextResponse.json({ 
      success: true,
      appointmentTime: appointmentTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      doctorName: schedule.doctorName,
      department: patient.department,
      roomNumber: schedule.roomNumber,
      queuePosition: queuePosition + 1
    })
    
  } catch (error) {
    console.error('Appointment lookup error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}