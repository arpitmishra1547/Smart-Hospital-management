import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function POST(request) {
  try {
    const { latitude, longitude } = await request.json()
    
    if (!latitude || !longitude) {
      return NextResponse.json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('hospital-management')
    
    // AIIMS Bhopal coordinates (example - replace with actual coordinates)
    const hospitalCoords = {
      lat: 23.2599,
      lng: 77.4126
    }
    
    // Calculate distance
    const distance = calculateDistance(
      latitude,
      longitude,
      hospitalCoords.lat,
      hospitalCoords.lng
    )
    
    let response = {
      success: true,
      distance: Math.round(distance),
      hospitalName: 'AIIMS Bhopal'
    }
    
    // If within 100m, generate a token
    if (distance <= 100) {
      try {
        // Generate token number
        const counter = await db.collection('counters').findOneAndUpdate(
          { _id: 'token' },
          { $inc: { sequence: 1 } },
          { upsert: true, returnDocument: 'after' }
        )
        
        const tokenNumber = `T-${String(counter.sequence).padStart(3, '0')}`
        
        // Save token to database
        await db.collection('tokens').insertOne({
          tokenNumber,
          generatedAt: new Date(),
          date: new Date().toISOString().split('T')[0],
          location: { latitude, longitude },
          distance: Math.round(distance),
          status: 'Active'
        })
        
        response.tokenNumber = tokenNumber
        response.message = 'Token generated successfully'
      } catch (tokenError) {
        console.error('Token generation error:', tokenError)
        response.tokenError = 'Failed to generate token'
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Location distance error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}