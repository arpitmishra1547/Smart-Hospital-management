import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

async function ensureIndexes(db) {
  await db.collection('departments').createIndex({ departmentId: 1 }, { unique: true });
  await db.collection('departments').createIndex({ name: 1 }, { unique: true });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    const client = await clientPromise;
    const db = client.db('hospital-management');
    await ensureIndexes(db);

    const query = departmentId ? { departmentId } : {};
    const departments = await db.collection('departments').find(query, {
      projection: {
        _id: 0,
        departmentId: 1,
        name: 1,
        description: 1,
        headDoctor: 1,
        doctorCount: 1,
        patientLoad: 1,
        opdRooms: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1
      },
      sort: { name: 1 }
    }).toArray();

    return NextResponse.json({ success: true, total: departments.length, departments });
  } catch (error) {
    console.error('Departments GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { action } = payload;
    
    console.log('Departments API POST request:', { action, payload });

    const client = await clientPromise;
    const db = client.db('hospital-management');
    await ensureIndexes(db);

    if (action === 'add') {
      const { name, description, headDoctor } = payload;
      if (!name) {
        return NextResponse.json({ success: false, message: 'Department name is required' }, { status: 400 });
      }

      // Check if department already exists
      const existingDept = await db.collection('departments').findOne({ name });
      if (existingDept) {
        return NextResponse.json({ success: false, message: 'Department already exists' }, { status: 400 });
      }

      // Generate department ID
      const departmentId = `DEPT-${Date.now().toString().slice(-6)}`;

      const doc = {
        departmentId,
        name,
        description: description || '',
        headDoctor: headDoctor || null,
        doctorCount: 0,
        patientLoad: 0,
        opdRooms: [],
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('departments').insertOne(doc);
      console.log('Department added successfully:', result);
      return NextResponse.json({ success: true, department: doc });
    }

    if (action === 'update') {
      const { departmentId, name, description, headDoctor } = payload;
      if (!departmentId) {
        return NextResponse.json({ success: false, message: 'Department ID is required' }, { status: 400 });
      }

      const updateData = {
        updatedAt: new Date()
      };

      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (headDoctor !== undefined) updateData.headDoctor = headDoctor;

      const result = await db.collection('departments').updateOne(
        { departmentId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Department not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Department updated successfully' });
    }

    if (action === 'remove') {
      const { departmentId } = payload;
      if (!departmentId) {
        return NextResponse.json({ success: false, message: 'Department ID is required' }, { status: 400 });
      }

      // Check if department has doctors or OPD rooms
      const doctors = await db.collection('doctors_list').countDocuments({ department: departmentId });
      const opdRooms = await db.collection('opd_rooms').countDocuments({ departmentId });
      
      if (doctors > 0 || opdRooms > 0) {
        return NextResponse.json({ 
          success: false, 
          message: `Cannot delete department. It has ${doctors} doctors and ${opdRooms} OPD rooms assigned.` 
        }, { status: 400 });
      }

      const result = await db.collection('departments').deleteOne({ departmentId });
      if (result.deletedCount === 0) {
        return NextResponse.json({ success: false, message: 'Department not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Department removed successfully' });
    }

    if (action === 'assignDoctor') {
      const { departmentId, doctorId } = payload;
      if (!departmentId || !doctorId) {
        return NextResponse.json({ success: false, message: 'Department ID and Doctor ID are required' }, { status: 400 });
      }

      // Update doctor's department
      const doctorResult = await db.collection('doctors_list').updateOne(
        { doctorId },
        { $set: { department: departmentId, updatedAt: new Date() } }
      );

      if (doctorResult.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
      }

      // Update department doctor count
      await db.collection('departments').updateOne(
        { departmentId },
        { 
          $inc: { doctorCount: 1 },
          $set: { updatedAt: new Date() }
        }
      );

      return NextResponse.json({ success: true, message: 'Doctor assigned to department successfully' });
    }

    if (action === 'updatePatientLoad') {
      const { departmentId, patientLoad } = payload;
      if (!departmentId || patientLoad === undefined) {
        return NextResponse.json({ success: false, message: 'Department ID and patient load are required' }, { status: 400 });
      }

      const result = await db.collection('departments').updateOne(
        { departmentId },
        { 
          $set: { 
            patientLoad: parseInt(patientLoad),
            updatedAt: new Date() 
          }
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Department not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Patient load updated successfully' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Departments API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
