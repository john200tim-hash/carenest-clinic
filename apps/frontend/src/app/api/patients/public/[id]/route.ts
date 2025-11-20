import { NextResponse } from 'next/server';

// This is a mock database for local testing.
// In a real app, this would connect to your actual database.
let mockPatients: any[] = [
  {
    id: '1',
    name: 'John Doe',
    dateOfBirth: new Date('1985-04-12').toISOString(),
    gender: 'Male',
    contactNumber: '555-0101',
    address: '123 Maple St, Springfield',
    medicalHistory: 'Pollen allergy',
    symptoms: [], diagnoses: [], bills: [], prescriptions: [],
  },
  {
    id: '2',
    name: 'Jane Smith',
    dateOfBirth: new Date('1992-08-23').toISOString(),
    gender: 'Female',
    contactNumber: '555-0102',
    address: '456 Oak Ave, Springfield',
    medicalHistory: 'None',
    symptoms: [], diagnoses: [], bills: [], prescriptions: [],
  },
];

// This is a PUBLIC endpoint for a patient to fetch their own data.
// It does not require doctor authentication.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const patient = mockPatients.find(p => p.id === params.id);

  if (patient) {
    // In a real app, you might want to omit certain sensitive fields
    // before sending the data to the patient.
    return NextResponse.json(patient);
  } else {
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  }
}