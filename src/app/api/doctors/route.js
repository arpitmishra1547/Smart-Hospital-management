import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("hospital-management");

    // Get specialized doctors from the database
    const doctors = await db.collection("doctors_list").find({}, { 
      projection: { 
        name: 1, 
        specialization: 1, 
        department: 1,
        _id: 0 
      } 
    }).toArray();

    // If no doctors in DB, return default list
    if (doctors.length === 0) {
      const defaultDoctors = [
        { name: "Dr. Sarah Johnson", specialization: "Cardiology", department: "Cardiology" },
        { name: "Dr. Michael Chen", specialization: "Dermatology", department: "Dermatology" },
        { name: "Dr. Emily Rodriguez", specialization: "Orthopedics", department: "Orthopedics" },
        { name: "Dr. James Wilson", specialization: "General Medicine", department: "General Medicine" },
        { name: "Dr. Lisa Thompson", specialization: "Pediatrics", department: "Pediatrics" },
        { name: "Dr. Robert Kim", specialization: "Neurology", department: "Neurology" },
        { name: "Dr. Maria Garcia", specialization: "Gynecology", department: "Gynecology" },
        { name: "Dr. David Lee", specialization: "Psychiatry", department: "Psychiatry" }
      ];
      return NextResponse.json(defaultDoctors);
    }

    return NextResponse.json(doctors);

  } catch (error) {
    console.error('Database error:', error);
    // Return default list if database error
    const defaultDoctors = [
      { name: "Dr. Sarah Johnson", specialization: "Cardiology", department: "Cardiology" },
      { name: "Dr. Michael Chen", specialization: "Dermatology", department: "Dermatology" },
      { name: "Dr. Emily Rodriguez", specialization: "Orthopedics", department: "Orthopedics" },
      { name: "Dr. James Wilson", specialization: "General Medicine", department: "General Medicine" },
      { name: "Dr. Lisa Thompson", specialization: "Pediatrics", department: "Pediatrics" },
      { name: "Dr. Robert Kim", specialization: "Neurology", department: "Neurology" },
      { name: "Dr. Maria Garcia", specialization: "Gynecology", department: "Gynecology" },
      { name: "Dr. David Lee", specialization: "Psychiatry", department: "Psychiatry" }
    ];
    return NextResponse.json(defaultDoctors);
  }
}
