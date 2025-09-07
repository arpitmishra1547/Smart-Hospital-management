import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { patientId, tokenNumber } = await request.json();
    const client = await clientPromise;
    const db = client.db("hospital-management");

    // Validate required fields
    if (!patientId || !tokenNumber) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: patientId, tokenNumber" 
      }, { status: 400 });
    }

    // Get patient details to verify token ownership
    const patient = await db.collection("patients_profile").findOne({ 
      patientId: patientId 
    });

    if (!patient) {
      return NextResponse.json({ 
        success: false, 
        message: "Patient not found" 
      }, { status: 404 });
    }

    // Verify the token belongs to this patient
    if (patient.tokenNumber !== tokenNumber) {
      return NextResponse.json({ 
        success: false, 
        message: "Token does not belong to this patient" 
      }, { status: 400 });
    }

    // Find and cancel the token
    const tokenResult = await db.collection("tokens").findOneAndUpdate(
      { 
        tokenNumber: tokenNumber,
        patientId: patientId,
        status: "Active"
      },
      { 
        $set: { 
          status: "Cancelled",
          cancelledAt: new Date(),
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    if (!tokenResult.value) {
      return NextResponse.json({ 
        success: false, 
        message: "Token not found or already processed" 
      }, { status: 404 });
    }

    // Update patient status back to "Registered"
    await db.collection("patients_profile").updateOne(
      { patientId: patientId },
      { 
        $set: { 
          tokenStatus: "Registered",
          updatedAt: new Date()
        },
        $unset: {
          tokenNumber: "",
          tokenGeneratedAt: ""
        }
      }
    );

    // Update hospital_locations to remove token info
    await db.collection("hospital_locations").updateOne(
      { patientId: patientId },
      { 
        $set: { 
          updatedAt: new Date()
        },
        $unset: {
          tokenNumber: "",
          tokenGeneratedAt: ""
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Token cancelled successfully",
      cancelledToken: {
        tokenNumber: tokenNumber,
        cancelledAt: tokenResult.value.cancelledAt
      }
    });

  } catch (error) {
    console.error('Token cancellation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
}