import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { doctorId } = await request.json();
    if (!doctorId) {
      return NextResponse.json({ success: false, message: 'doctorId is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hospital-management');
    await db.collection('doctors_list').createIndex({ doctorId: 1 }, { unique: true });

    const doctor = await db.collection('doctors_list').findOne(
      { doctorId },
      { projection: { _id: 0 } }
    );

    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
    }

    if (doctor.status && doctor.status !== 'Active') {
      return NextResponse.json({ success: false, message: `Doctor is ${doctor.status}` }, { status: 403 });
    }

    // For now, return doctor profile; frontend can store doctorId as session
    return NextResponse.json({ success: true, doctor });
  } catch (error) {
    console.error('Doctor login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}



