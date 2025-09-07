import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance * 1000; // Convert to meters
}

export async function POST(request) {
  try {
    const { patientId, currentLat, currentLng } = await request.json();
    const client = await clientPromise;
    const db = client.db("hospital-management");

    // Validate required fields
    if (!patientId || currentLat === undefined || currentLng === undefined) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: patientId, currentLat, currentLng" 
      }, { status: 400 });
    }

    // Get patient details
    const patient = await db.collection("patients_profile").findOne({ 
      patientId: patientId 
    });

    if (!patient) {
      return NextResponse.json({ 
        success: false, 
        message: "Patient not found" 
      }, { status: 404 });
    }

    // Check if patient already has a token
    if (patient.tokenStatus === "Token Generated") {
      return NextResponse.json({ 
        success: false, 
        message: "Patient already has a token" 
      }, { status: 400 });
    }

    // Get hospital location for this patient
    const hospitalLocation = await db.collection("hospital_locations").findOne({ 
      patientId: patientId 
    });

    if (!hospitalLocation) {
      return NextResponse.json({ 
        success: false, 
        message: "Hospital location not found for this patient" 
      }, { status: 404 });
    }

    let distance = 0;
    let isTestHospital = false;

    // Check if this is Test Hospital (always within 100m for testing)
    if (hospitalLocation.hospitalName === "Test Hospital") {
      distance = 50; // Always set to 50m for Test Hospital
      isTestHospital = true;
    } else {
      // Calculate distance between patient's current location and hospital
      distance = calculateDistance(
        currentLat, 
        currentLng, 
        hospitalLocation.coordinates.lat, 
        hospitalLocation.coordinates.lng
      );
    }

    // Check if patient is within 100 meters of hospital (skip for Test Hospital)
    if (!isTestHospital && distance > 100) {
      return NextResponse.json({ 
        success: false, 
        message: `Patient is ${Math.round(distance)} meters away from hospital. Must be within 100 meters to generate token.`,
        distance: Math.round(distance),
        isTestHospital: false
      }, { status: 400 });
    }

    // Generate unique token number for this hospital and department for today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get today's token count for this hospital and department
    const todayTokens = await db.collection("tokens").countDocuments({
      hospitalName: hospitalLocation.hospitalName,
      department: hospitalLocation.department,
      date: todayStr
    });

    // Generate token number (format: HOSPITAL-DEPARTMENT-001, 002, etc.)
    const tokenNumber = `${hospitalLocation.hospitalName.substring(0, 3).toUpperCase()}-${hospitalLocation.department.substring(0, 3).toUpperCase()}-${String(todayTokens + 1).padStart(3, '0')}`;

    // Create token document
    const token = {
      tokenNumber,
      patientId,
      patientName: patient.fullName,
      hospitalName: hospitalLocation.hospitalName,
      department: hospitalLocation.department,
      city: hospitalLocation.city,
      date: todayStr,
      generatedAt: new Date(),
      status: "Active",
      location: {
        lat: currentLat,
        lng: currentLng,
        distance: Math.round(distance)
      }
    };

    // Save token to database
    const tokenResult = await db.collection("tokens").insertOne(token);

    if (tokenResult.insertedId) {
      // Update patient status to "Token Generated"
      await db.collection("patients_profile").updateOne(
        { patientId: patientId },
        { 
          $set: { 
            tokenStatus: "Token Generated",
            tokenNumber: tokenNumber,
            tokenGeneratedAt: new Date(),
            updatedAt: new Date()
          } 
        }
      );

      // Update hospital_locations with token info
      await db.collection("hospital_locations").updateOne(
        { patientId: patientId },
        { 
          $set: { 
            tokenNumber: tokenNumber,
            tokenGeneratedAt: new Date(),
            updatedAt: new Date()
          } 
        }
      );

      return NextResponse.json({ 
        success: true, 
        message: isTestHospital ? "Token generated successfully for Test Hospital" : "Token generated successfully",
        token: {
          tokenNumber,
          patientName: patient.fullName,
          hospitalName: hospitalLocation.hospitalName,
          department: hospitalLocation.department,
          city: hospitalLocation.city,
          date: todayStr,
          generatedAt: token.generatedAt,
          distance: Math.round(distance),
          isTestHospital: isTestHospital
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to generate token" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
}
