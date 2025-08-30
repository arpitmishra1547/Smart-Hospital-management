import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const patientData = await request.json();
    const client = await clientPromise;
    const db = client.db("hospital-management");

    // Validate required fields
    const requiredFields = [
      'fullName', 'dateOfBirth', 'age', 'gender', 'mobileNumber', 
      'aadhaarNumber', 'address', 'city', 'hospitalName', 'department',
      'hospitalCoordinates'
    ];

    for (const field of requiredFields) {
      if (!patientData[field]) {
        return NextResponse.json({ 
          success: false, 
          message: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    // Check if mobile number already exists
    const existingPatient = await db.collection("patients_profile").findOne({ 
      mobileNumber: patientData.mobileNumber 
    });

    if (existingPatient) {
      return NextResponse.json({ 
        success: false, 
        message: "Patient with this mobile number already exists" 
      }, { status: 400 });
    }

    // Check if Aadhaar number already exists
    const existingAadhaar = await db.collection("patients_profile").findOne({ 
      aadhaarNumber: patientData.aadhaarNumber 
    });

    if (existingAadhaar) {
      return NextResponse.json({ 
        success: false, 
        message: "Patient with this Aadhaar number already exists" 
      }, { status: 400 });
    }

    // Create patient document
    const patient = {
      ...patientData,
      patientId: `P${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      status: "Registered",
      tokenStatus: "Token Pending",
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to patients_profile collection
    const result = await db.collection("patients_profile").insertOne(patient);

    if (result.insertedId) {
      // Save to patients_mobileNumbers collection for quick lookup
      await db.collection("patients_mobileNumbers").insertOne({ 
        mobileNumber: patientData.mobileNumber,
        patientId: patient.patientId,
        createdAt: new Date()
      });

      // Save to patients_aadhaar collection for Aadhaar lookup
      await db.collection("patients_aadhaar").insertOne({ 
        aadhaarNumber: patientData.aadhaarNumber,
        patientId: patient.patientId,
        createdAt: new Date()
      });

      // Save hospital location data
      await db.collection("hospital_locations").insertOne({
        hospitalName: patientData.hospitalName,
        city: patientData.city,
        coordinates: patientData.hospitalCoordinates,
        department: patientData.department,
        patientId: patient.patientId,
        createdAt: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        message: "Patient registered successfully",
        patient: {
          patientId: patient.patientId,
          fullName: patient.fullName,
          mobileNumber: patient.mobileNumber,
          status: patient.status,
          tokenStatus: patient.tokenStatus
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to register patient" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
}
