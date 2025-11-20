import { NextResponse } from 'next/server';
import { db } from '../../_db'; // Corrected import path

// This is a public endpoint for patients to request an appointment.
export async function POST(request: Request) {
  try {
    const { name, emailOrMobile, reason, preferredDate, preferredTime } = await request.json();

    if (!name || !emailOrMobile || !reason || !preferredDate || !preferredTime) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    // Check if patient exists, if not, create one
    let patient = db.mockPatients.find(p => p.emailOrMobile === emailOrMobile);
    if (!patient) {
      patient = {
        id: `PAT${Date.now()}`,
        name,
        emailOrMobile,
        dateOfBirth: new Date(), // Default value
        gender: '',
        contactNumber: emailOrMobile.includes('@') ? '' : emailOrMobile,
        address: '',
        symptoms: [], diagnoses: [], bills: [], prescriptions: [],
      };
      db.mockPatients.push(patient);
    }

    // In a real app, you would save the appointment request to the database
    // and associate it with the patient.id
    console.log('New Appointment Request Received:', {
      patientId: patient.id,
      reason,
      preferredDate,
      preferredTime
    });

    return NextResponse.json({ message: 'Request submitted successfully', patientId: patient.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}