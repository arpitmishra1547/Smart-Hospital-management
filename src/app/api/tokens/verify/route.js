import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenNumber = searchParams.get('tokenNumber');
    if (!tokenNumber) {
      return NextResponse.json({ success: false, message: 'tokenNumber is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hospital-management');
    const token = await db.collection('tokens').findOne({ tokenNumber });
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token Not Found' }, { status: 404 });
    }

    // Fetch full patient details
    const patient = await db.collection('patients_profile').findOne({ patientId: token.patientId }, { projection: { _id: 0 } });
    if (!patient) {
      return NextResponse.json({ success: false, message: 'Patient not found for this token' }, { status: 404 });
    }

    return NextResponse.json({ success: true, token, patient });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}



