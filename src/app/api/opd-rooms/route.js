import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

async function ensureIndexes(db) {
  await db.collection('opd_rooms').createIndex({ roomId: 1 }, { unique: true });
  await db.collection('opd_rooms').createIndex({ roomNumber: 1 }, { unique: true });
  await db.collection('opd_rooms').createIndex({ departmentId: 1 });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const departmentId = searchParams.get('departmentId');

    const client = await clientPromise;
    const db = client.db('hospital-management');
    await ensureIndexes(db);

    const query = {};
    if (roomId) query.roomId = roomId;
    if (departmentId) query.departmentId = departmentId;

    const rooms = await db.collection('opd_rooms').find(query, {
      projection: {
        _id: 0,
        roomId: 1,
        roomNumber: 1,
        departmentId: 1,
        departmentName: 1,
        assignedDoctor: 1,
        doctorName: 1,
        timeSlots: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1
      },
      sort: { roomNumber: 1 }
    }).toArray();

    return NextResponse.json({ success: true, total: rooms.length, rooms });
  } catch (error) {
    console.error('OPD Rooms GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { action } = payload;
    
    console.log('OPD Rooms API POST request:', { action, payload });

    const client = await clientPromise;
    const db = client.db('hospital-management');
    await ensureIndexes(db);

    if (action === 'add') {
      const { roomNumber, departmentId, departmentName } = payload;
      if (!roomNumber || !departmentId) {
        return NextResponse.json({ success: false, message: 'Room number and department ID are required' }, { status: 400 });
      }

      // Check if room number already exists
      const existingRoom = await db.collection('opd_rooms').findOne({ roomNumber });
      if (existingRoom) {
        return NextResponse.json({ success: false, message: 'Room number already exists' }, { status: 400 });
      }

      // Generate room ID
      const roomId = `ROOM-${roomNumber}`;

      const doc = {
        roomId,
        roomNumber,
        departmentId,
        departmentName: departmentName || '',
        assignedDoctor: null,
        doctorName: null,
        timeSlots: [],
        status: 'Available',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('opd_rooms').insertOne(doc);
      console.log('OPD Room added successfully:', result);

      // Update department's OPD rooms list
      await db.collection('departments').updateOne(
        { departmentId },
        { 
          $push: { opdRooms: roomId },
          $set: { updatedAt: new Date() }
        }
      );

      return NextResponse.json({ success: true, room: doc });
    }

    if (action === 'update') {
      const { roomId, roomNumber, departmentId, departmentName, status } = payload;
      if (!roomId) {
        return NextResponse.json({ success: false, message: 'Room ID is required' }, { status: 400 });
      }

      const updateData = {
        updatedAt: new Date()
      };

      if (roomNumber) updateData.roomNumber = roomNumber;
      if (departmentId) updateData.departmentId = departmentId;
      if (departmentName !== undefined) updateData.departmentName = departmentName;
      if (status) updateData.status = status;

      const result = await db.collection('opd_rooms').updateOne(
        { roomId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Room updated successfully' });
    }

    if (action === 'remove') {
      const { roomId } = payload;
      if (!roomId) {
        return NextResponse.json({ success: false, message: 'Room ID is required' }, { status: 400 });
      }

      // Get room details before deletion
      const room = await db.collection('opd_rooms').findOne({ roomId });
      if (!room) {
        return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
      }

      const result = await db.collection('opd_rooms').deleteOne({ roomId });

      // Remove room from department's OPD rooms list
      if (room.departmentId) {
        await db.collection('departments').updateOne(
          { departmentId: room.departmentId },
          { 
            $pull: { opdRooms: roomId },
            $set: { updatedAt: new Date() }
          }
        );
      }

      return NextResponse.json({ success: true, message: 'Room removed successfully' });
    }

    if (action === 'assignDoctor') {
      const { roomId, doctorId, doctorName } = payload;
      if (!roomId || !doctorId) {
        return NextResponse.json({ success: false, message: 'Room ID and Doctor ID are required' }, { status: 400 });
      }

      const result = await db.collection('opd_rooms').updateOne(
        { roomId },
        { 
          $set: { 
            assignedDoctor: doctorId,
            doctorName: doctorName || '',
            updatedAt: new Date() 
          }
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Doctor assigned to room successfully' });
    }

    if (action === 'unassignDoctor') {
      const { roomId } = payload;
      if (!roomId) {
        return NextResponse.json({ success: false, message: 'Room ID is required' }, { status: 400 });
      }

      const result = await db.collection('opd_rooms').updateOne(
        { roomId },
        { 
          $set: { 
            assignedDoctor: null,
            doctorName: null,
            timeSlots: [],
            updatedAt: new Date() 
          }
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Doctor unassigned from room successfully' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('OPD Rooms API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
