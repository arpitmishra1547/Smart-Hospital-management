import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ success: false, message: 'patientId is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hospital-management');

    const prescriptions = await db.collection('prescriptions')
      .find({ patientId }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, prescriptions });
  } catch (error) {
    console.error('Patient history error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}



