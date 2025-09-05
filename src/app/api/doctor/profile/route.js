import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    if (!doctorId) {
      return NextResponse.json({ success: false, message: 'doctorId is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hospital-management');
    const doctor = await db.collection('doctors_list').findOne({ doctorId }, { projection: { _id: 0 } });

    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, doctor });
  } catch (error) {
    console.error('Doctor profile error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}



