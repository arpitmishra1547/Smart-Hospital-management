import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const patientData = await request.json();
    const client = await clientPromise;
    const db = client.db("hospital-management");

    // Check if this is a chatbot registration (simpler format)
    const isChatbotRegistration = patientData.name && !patientData.fullName;
    
    let requiredFields, processedData;
    
    if (isChatbotRegistration) {
      // Chatbot registration - simpler validation
      requiredFields = ['name', 'age', 'gender', 'mobile', 'department', 'hospital'];
      
      for (const field of requiredFields) {
        if (!patientData[field]) {
          return NextResponse.json({ 
            success: false, 
            message: `Missing required field: ${field}` 
          }, { status: 400 });
        }
      }
      
      // Convert chatbot format to standard format
      processedData = {
        fullName: patientData.name,
        age: parseInt(patientData.age),
        gender: patientData.gender,
        mobileNumber: patientData.mobile,
        department: patientData.department,
        hospitalName: patientData.hospital,
        // Default values for chatbot registration
        dateOfBirth: '',
        aadhaarNumber: `TEMP-${Date.now()}`, // Temporary Aadhaar for chatbot
        address: 'Not provided',
        city: 'Bhopal',
        hospitalCoordinates: { lat: 23.2599, lng: 77.4126 } // AIIMS Bhopal coords
      };
    } else {
      // Full registration - original validation
      requiredFields = [
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
      
      processedData = patientData;
    }

    // Check if mobile number already exists
    const existingPatient = await db.collection("patients_profile").findOne({ 
      mobileNumber: processedData.mobileNumber 
    });

    if (existingPatient) {
      return NextResponse.json({ 
        success: false, 
        message: "Patient with this mobile number already exists" 
      }, { status: 400 });
    }

    // Check if Aadhaar number already exists (skip for chatbot temp Aadhaar)
    if (!isChatbotRegistration) {
      const existingAadhaar = await db.collection("patients_profile").findOne({ 
        aadhaarNumber: processedData.aadhaarNumber 
      });

      if (existingAadhaar) {
        return NextResponse.json({ 
          success: false, 
          message: "Patient with this Aadhaar number already exists" 
        }, { status: 400 });
      }
    }

    // Create patient document
    const patient = {
      ...processedData,
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
        mobileNumber: processedData.mobileNumber,
        patientId: patient.patientId,
        createdAt: new Date()
      });

      // Save to patients_aadhaar collection for Aadhaar lookup (skip for chatbot)
      if (!isChatbotRegistration) {
        await db.collection("patients_aadhaar").insertOne({ 
          aadhaarNumber: processedData.aadhaarNumber,
          patientId: patient.patientId,
          createdAt: new Date()
        });
      }

      // Save hospital location data
      await db.collection("hospital_locations").insertOne({
        hospitalName: processedData.hospitalName,
        city: processedData.city,
        coordinates: processedData.hospitalCoordinates,
        department: processedData.department,
        patientId: patient.patientId,
        createdAt: new Date()
      });

      // Generate token for AIIMS Bhopal registrations from chatbot
      let tokenNumber = null;
      if (isChatbotRegistration && processedData.hospitalName.toLowerCase().includes('aiims') && processedData.hospitalName.toLowerCase().includes('bhopal')) {
        try {
          const counter = await db.collection('counters').findOneAndUpdate(
            { _id: 'token' },
            { $inc: { sequence: 1 } },
            { upsert: true, returnDocument: 'after' }
          );
          
          tokenNumber = `T-${String(counter.sequence).padStart(3, '0')}`;
          
          // Update patient with token
          await db.collection("patients_profile").updateOne(
            { patientId: patient.patientId },
            { 
              $set: { 
                tokenNumber: tokenNumber,
                tokenStatus: "Token Generated",
                tokenGeneratedAt: new Date()
              }
            }
          );
          
          // Save token record
          await db.collection("tokens").insertOne({
            tokenNumber,
            patientId: patient.patientId,
            department: processedData.department,
            hospitalName: processedData.hospitalName,
            date: new Date().toISOString().split('T')[0],
            status: 'Active',
            generatedAt: new Date()
          });
        } catch (tokenError) {
          console.error('Token generation error:', tokenError);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: "Patient registered successfully",
        tokenNumber: tokenNumber,
        patient: {
          patientId: patient.patientId,
          fullName: patient.fullName,
          mobileNumber: patient.mobileNumber,
          status: patient.status,
          tokenStatus: tokenNumber ? "Token Generated" : patient.tokenStatus
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
