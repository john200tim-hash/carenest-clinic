import { NextResponse } from 'next/server';
import { db } from '@/api/_db'; // Definitive path alias

// This is a mock login endpoint for local testing.
export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Find the doctor in our shared database
  const doctor = db.mockDoctors.find(
    (doc) => doc.email === email && doc.password === password
  );

  if (doctor) {
    return NextResponse.json({
      message: 'Login successful',
      token: `mock-jwt-token-for-${doctor.id}`, // A fake token for local testing
    });
  }

  return NextResponse.json(
    { message: 'Invalid credentials' },
    { status: 401 }
  );
}