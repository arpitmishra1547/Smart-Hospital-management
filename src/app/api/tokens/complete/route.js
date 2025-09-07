import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { tokenNumber, doctorId, prescriptionId } = await request.json();
    const client = await clientPromise;
    const db = client.db("hospital-management");

    // Validate required fields
    if (!tokenNumber || !doctorId) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: tokenNumber, doctorId" 
      }, { status: 400 });
    }

    // Find and complete the token
    const tokenResult = await db.collection("tokens").findOneAndUpdate(
      { 
        tokenNumber: tokenNumber,
        status: "Active"
      },
      { 
        $set: { 
          status: "Completed",
          completedAt: new Date(),
          doctorId: doctorId,
          prescriptionId: prescriptionId || null,
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

    // Update patient status to "Completed"
    await db.collection("patients_profile").updateOne(
      { patientId: tokenResult.value.patientId },
      { 
        $set: { 
          tokenStatus: "Completed",
          consultationCompletedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Update hospital_locations with completion info
    await db.collection("hospital_locations").updateOne(
      { patientId: tokenResult.value.patientId },
      { 
        $set: { 
          tokenStatus: "Completed",
          consultationCompletedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Token completed successfully",
      completedToken: {
        tokenNumber: tokenNumber,
        patientId: tokenResult.value.patientId,
        patientName: tokenResult.value.patientName,
        completedAt: tokenResult.value.completedAt,
        doctorId: doctorId,
        prescriptionId: prescriptionId
      }
    });

  } catch (error) {
    console.error('Token completion error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
}