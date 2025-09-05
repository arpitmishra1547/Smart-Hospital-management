import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

async function ensureIndexes(db) {
  await db.collection('schedules').createIndex({ scheduleId: 1 }, { unique: true });
  await db.collection('schedules').createIndex({ roomId: 1 });
  await db.collection('schedules').createIndex({ doctorId: 1 });
  await db.collection('schedules').createIndex({ date: 1 });
  await db.collection('schedules').createIndex({ startTime: 1, endTime: 1 });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');
    const roomId = searchParams.get('roomId');
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const week = searchParams.get('week'); // YYYY-WW format

    const client = await clientPromise;
    const db = client.db('hospital-management');
    await ensureIndexes(db);

    const query = {};
    if (scheduleId) query.scheduleId = scheduleId;
    if (roomId) query.roomId = roomId;
    if (doctorId) query.doctorId = doctorId;
    if (date) query.date = date;

    // If week is specified, get all dates in that week
    if (week) {
      const [year, weekNum] = week.split('-');
      const startDate = getDateOfWeek(parseInt(year), parseInt(weekNum));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      query.date = {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      };
    }

    const schedules = await db.collection('schedules').find(query, {
      projection: {
        _id: 0,
        scheduleId: 1,
        roomId: 1,
        roomNumber: 1,
        doctorId: 1,
        doctorName: 1,
        departmentId: 1,
        departmentName: 1,
        date: 1,
        startTime: 1,
        endTime: 1,
        isRecurring: 1,
        recurringPattern: 1,
        status: 1,
        notes: 1,
        createdAt: 1,
        updatedAt: 1
      },
      sort: { date: 1, startTime: 1 }
    }).toArray();

    return NextResponse.json({ success: true, total: schedules.length, schedules });
  } catch (error) {
    console.error('Schedules GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { action } = payload;
    
    console.log('Schedules API POST request:', { action, payload });

    const client = await clientPromise;
    const db = client.db('hospital-management');
    await ensureIndexes(db);

    if (action === 'add') {
      const { 
        roomId, 
        roomNumber, 
        doctorId, 
        doctorName, 
        departmentId, 
        departmentName, 
        date, 
        startTime, 
        endTime, 
        isRecurring = false, 
        recurringPattern = null,
        notes = '' 
      } = payload;

      if (!roomId || !doctorId || !date || !startTime || !endTime) {
        return NextResponse.json({ 
          success: false, 
          message: 'Room ID, Doctor ID, date, start time, and end time are required' 
        }, { status: 400 });
      }

      // Check for time conflicts
      const conflict = await db.collection('schedules').findOne({
        roomId,
        date,
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ],
        status: { $ne: 'Cancelled' }
      });

      if (conflict) {
        return NextResponse.json({ 
          success: false, 
          message: `Time conflict: Room ${roomNumber} is already scheduled from ${conflict.startTime} to ${conflict.endTime}` 
        }, { status: 400 });
      }

      // Generate schedule ID
      const scheduleId = `SCH-${Date.now().toString().slice(-8)}`;

      const doc = {
        scheduleId,
        roomId,
        roomNumber: roomNumber || '',
        doctorId,
        doctorName: doctorName || '',
        departmentId: departmentId || '',
        departmentName: departmentName || '',
        date,
        startTime,
        endTime,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : null,
        status: 'Active',
        notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('schedules').insertOne(doc);
      console.log('Schedule added successfully:', result);

      // If recurring, create additional schedules
      if (isRecurring && recurringPattern) {
        await createRecurringSchedules(db, doc, recurringPattern);
      }

      return NextResponse.json({ success: true, schedule: doc });
    }

    if (action === 'update') {
      const { scheduleId, startTime, endTime, notes, status } = payload;
      if (!scheduleId) {
        return NextResponse.json({ success: false, message: 'Schedule ID is required' }, { status: 400 });
      }

      const updateData = {
        updatedAt: new Date()
      };

      if (startTime) updateData.startTime = startTime;
      if (endTime) updateData.endTime = endTime;
      if (notes !== undefined) updateData.notes = notes;
      if (status) updateData.status = status;

      const result = await db.collection('schedules').updateOne(
        { scheduleId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Schedule updated successfully' });
    }

    if (action === 'remove') {
      const { scheduleId } = payload;
      if (!scheduleId) {
        return NextResponse.json({ success: false, message: 'Schedule ID is required' }, { status: 400 });
      }

      const result = await db.collection('schedules').deleteOne({ scheduleId });
      if (result.deletedCount === 0) {
        return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Schedule removed successfully' });
    }

    if (action === 'emergencyReassign') {
      const { scheduleId, newDoctorId, newDoctorName, notes } = payload;
      if (!scheduleId || !newDoctorId) {
        return NextResponse.json({ 
          success: false, 
          message: 'Schedule ID and new Doctor ID are required' 
        }, { status: 400 });
      }

      const result = await db.collection('schedules').updateOne(
        { scheduleId },
        { 
          $set: { 
            doctorId: newDoctorId,
            doctorName: newDoctorName || '',
            notes: notes || 'Emergency reassignment',
            updatedAt: new Date() 
          }
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Emergency reassignment completed successfully' });
    }

    if (action === 'bulkUpdate') {
      const { schedules } = payload;
      if (!Array.isArray(schedules) || schedules.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'Schedules array is required' 
        }, { status: 400 });
      }

      const bulkOps = schedules.map(schedule => ({
        updateOne: {
          filter: { scheduleId: schedule.scheduleId },
          update: {
            $set: {
              ...schedule,
              updatedAt: new Date()
            }
          }
        }
      }));

      const result = await db.collection('schedules').bulkWrite(bulkOps);
      return NextResponse.json({ 
        success: true, 
        message: `Updated ${result.modifiedCount} schedules successfully` 
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Schedules API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get date of a specific week
function getDateOfWeek(year, week) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

// Helper function to create recurring schedules
async function createRecurringSchedules(db, baseSchedule, pattern) {
  const { type, interval, endDate } = pattern;
  const schedules = [];
  const currentDate = new Date(baseSchedule.date);
  const end = new Date(endDate);

  while (currentDate <= end) {
    // Add interval based on type
    if (type === 'daily') {
      currentDate.setDate(currentDate.getDate() + interval);
    } else if (type === 'weekly') {
      currentDate.setDate(currentDate.getDate() + (7 * interval));
    } else if (type === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + interval);
    }

    if (currentDate <= end) {
      const recurringSchedule = {
        ...baseSchedule,
        scheduleId: `SCH-${Date.now().toString().slice(-8)}-${schedules.length}`,
        date: currentDate.toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      schedules.push(recurringSchedule);
    }
  }

  if (schedules.length > 0) {
    await db.collection('schedules').insertMany(schedules);
  }
}
