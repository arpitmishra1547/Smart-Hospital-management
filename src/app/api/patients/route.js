import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("hospital-management");

    // Fetch all patients from the patients_profile collection
    const patients = await db.collection("patients_profile")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      patients: patients 
    });
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch patients" 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { mobileNumber, action, patientData } = await request.json();
    const client = await clientPromise;
    const db = client.db("hospital-management");

    if (action === 'checkMobile') {
      // Check if mobile number exists
      const existingPatient = await db.collection("patients_mobileNumbers").findOne({ mobileNumber });
      
      if (existingPatient) {
        // Get patient profile
        const patientProfile = await db.collection("patients_profile").findOne({ mobileNumber });
        return NextResponse.json({ 
          exists: true, 
          patient: patientProfile 
        });
      } else {
        return NextResponse.json({ exists: false });
      }
    }

    if (action === 'createPatient') {
      // Create new patient
      const patientProfile = {
        ...patientData,
        mobileNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to both collections
      await db.collection("patients_profile").insertOne(patientProfile);
      await db.collection("patients_mobileNumbers").insertOne({ 
        mobileNumber,
        createdAt: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        message: "Patient created successfully",
        patient: patientProfile
      });
    }

    if (action === 'updatePatient') {
      // Update patient profile
      const updateData = {
        ...patientData,
        updatedAt: new Date()
      };

      const result = await db.collection("patients_profile").updateOne(
        { mobileNumber },
        { $set: updateData }
      );

      if (result.modifiedCount > 0) {
        return NextResponse.json({ 
          success: true, 
          message: "Patient updated successfully" 
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: "Patient not found" 
        });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
