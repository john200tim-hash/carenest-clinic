import { NextResponse } from 'next/server';
import { db } from '../_db';

// GET /api/appointments
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(db.mockAppointments);
}

// POST /api/appointments
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const appointmentData = await request.json();

    // --- Assign a random doctor ---
    const mockDoctorIds = ['doc_1', 'doc_2', 'doc_3']; // In a real app, get this from your database
    const randomDoctorId = mockDoctorIds[Math.floor(Math.random() * mockDoctorIds.length)];
    // -----------------------------

    const newAppointment = { ...appointmentData, doctorId: randomDoctorId, id: `appt${Date.now()}` };

    db.mockAppointments.push(newAppointment);
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }
}