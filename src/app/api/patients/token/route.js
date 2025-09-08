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
    
    if (!patient || !patient.tokenNumber) {
      return NextResponse.json({ 
        success: false, 
        message: 'No active token found' 
      }, { status: 404 })
    }
    
    // Get queue position by counting tokens generated before this one
    const queuePosition = await db.collection('tokens').countDocuments({
      department: patient.department,
      date: new Date().toISOString().split('T')[0],
      tokenNumber: { $lt: patient.tokenNumber },
      status: 'Active'
    })
    
    return NextResponse.json({ 
      success: true,
      tokenNumber: patient.tokenNumber,
      queuePosition: queuePosition + 1,
      department: patient.department,
      status: patient.tokenStatus
    })
    
  } catch (error) {
    console.error('Token lookup error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}