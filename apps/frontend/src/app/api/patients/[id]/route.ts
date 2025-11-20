import { NextResponse } from 'next/server';

// This is a mock database for local testing.
let mockPatients: any[] = [
  {
    id: '1',
    name: 'John Doe',
    dateOfBirth: new Date('1985-04-12').toISOString(),
    gender: 'Male',
    contactNumber: '555-0101',
    address: '123 Maple St, Springfield',
    medicalHistory: 'Pollen allergy',
    symptoms: [],
    diagnoses: [],
    bills: [],
    prescriptions: [],
  },
  {
    id: '2',
    name: 'Jane Smith',
    dateOfBirth: new Date('1992-08-23').toISOString(),
    gender: 'Female',
    contactNumber: '555-0102',
    address: '456 Oak Ave, Springfield',
    medicalHistory: 'None',
    symptoms: [],
    diagnoses: [],
    bills: [],
    prescriptions: [],
  },
];

function checkAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  return authHeader && authHeader.startsWith('Bearer ');
}

// GET /api/patients/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const patient = mockPatients.find(p => p.id === params.id);
  if (patient) {
    return NextResponse.json(patient);
  } else {
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  }
}

// DELETE /api/patients/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const patientId = params.id;
  const initialLength = mockPatients.length;
  mockPatients = mockPatients.filter((p) => p.id !== patientId);

  if (mockPatients.length < initialLength) {
    return NextResponse.json({ message: 'Patient deleted successfully' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  }
}

// PUT /api/patients/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const patientId = params.id;
  const updatedData = await request.json();
  const patientIndex = mockPatients.findIndex((p) => p.id === patientId);

  if (patientIndex === -1) {
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  }

  mockPatients[patientIndex] = { ...mockPatients[patientIndex], ...updatedData };
  return NextResponse.json(mockPatients[patientIndex], { status: 200 });
}

// POST /api/patients/[id]/[infoType]
export async function POST(request: Request, { params }: { params: { id: string, infoType: string } }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const patientId = params.id;
  const infoType = params.infoType as 'symptoms' | 'diagnoses' | 'prescriptions' | 'bills';
  const patientIndex = mockPatients.findIndex((p) => p.id === patientId);

  if (patientIndex === -1) {
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  }

  try {
    const newData = await request.json();
    const newItem = { ...newData, id: `${infoType}_${Date.now()}`, date: new Date() };
    
    // Ensure the array exists before pushing
    if (!mockPatients[patientIndex][infoType]) {
      mockPatients[patientIndex][infoType] = [];
    }
    mockPatients[patientIndex][infoType].push(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }
}