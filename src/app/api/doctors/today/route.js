import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request) {
  try {
    const client = await clientPromise
    const db = client.db('hospital-management')
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    
    // Get all active schedules for today
    const schedules = await db.collection('schedules').find({
      date: today,
      status: 'Active'
    }).toArray()
    
    if (schedules.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No doctors scheduled for today' 
      }, { status: 404 })
    }
    
    // Group by department and get unique doctors
    const doctorsToday = schedules.map(schedule => ({
      name: schedule.doctorName,
      department: schedule.departmentName,
      room: schedule.roomNumber,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    }))
    
    // Remove duplicates by doctorName
    const uniqueDoctors = doctorsToday.filter((doctor, index, self) => 
      index === self.findIndex(d => d.name === doctor.name)
    )
    
    return NextResponse.json(uniqueDoctors)
    
  } catch (error) {
    console.error('Doctors today error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}