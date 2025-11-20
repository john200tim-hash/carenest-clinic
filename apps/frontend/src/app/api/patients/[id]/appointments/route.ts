import { NextResponse } from 'next/server';
import { db } from '../../../_db';

// This is a PUBLIC endpoint for a patient to fetch their own appointments.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const patientId = params.id;

  if (!patientId) {
    return NextResponse.json({ message: 'Patient ID is required' }, { status: 400 });
  }

  const patientAppointments = db.mockAppointments.filter(appt => appt.patientId === patientId);

  return NextResponse.json(patientAppointments);
}