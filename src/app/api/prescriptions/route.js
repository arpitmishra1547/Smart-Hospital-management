import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const payload = await request.json();
    const { tokenNumber, doctorId, prescription } = payload;
    if (!tokenNumber || !doctorId || !prescription) {
      return NextResponse.json({ success: false, message: 'tokenNumber, doctorId, and prescription are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hospital-management');

    const token = await db.collection('tokens').findOne({ tokenNumber });
    if (!token) {
      return NextResponse.json({ success: false, message: 'Invalid token number' }, { status: 404 });
    }

    const doctor = await db.collection('doctors_list').findOne({ doctorId }, { projection: { _id: 0 } });
    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
    }

    const patient = await db.collection('patients_profile').findOne({ patientId: token.patientId }, { projection: { _id: 0 } });
    if (!patient) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    const doc = {
      tokenNumber,
      patientId: token.patientId,
      doctorId,
      doctorName: doctor.name,
      department: doctor.department,
      prescription: {
        symptoms: prescription.symptoms || '',
        diagnosis: prescription.diagnosis || '',
        medicines: Array.isArray(prescription.medicines) ? prescription.medicines : [],
        notes: prescription.notes || '',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('prescriptions').insertOne(doc);

    // mark token as completed and update patient record links
    await db.collection('tokens').updateOne({ tokenNumber }, { $set: { status: 'Completed', updatedAt: new Date() } });
    await db.collection('patients_profile').updateOne(
      { patientId: token.patientId },
      { $push: { prescriptions: { tokenNumber, prescriptionId: result.insertedId, createdAt: new Date() } }, $set: { updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, prescriptionId: result.insertedId });
  } catch (error) {
    console.error('Create prescription error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}



