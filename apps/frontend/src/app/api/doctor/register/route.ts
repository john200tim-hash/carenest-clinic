import { NextResponse } from 'next/server';
import { db } from '@/api/_db'; // Definitive path alias

const REGISTRATION_CODE = 'JOHN200TIM#';

export async function POST(request: Request) {
  try {
    const { email, password, registrationCode } = await request.json();

    if (registrationCode !== REGISTRATION_CODE) {
      return NextResponse.json({ message: 'Invalid registration code.' }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // Check if doctor already exists
    if (db.mockDoctors.find(doc => doc.email === email)) {
      return NextResponse.json({ message: 'A doctor with this email is already registered.' }, { status: 409 });
    }

    // Auto-generate a unique ID for the new doctor
    const newDoctor = {
      id: `doc_${Date.now()}`, // Simple unique ID generation
      email,
      password, // In a real app, this should be hashed
    };
    db.mockDoctors.push(newDoctor);
    
    // Return a token to auto-login the user
    const token = 'mock-jwt-token-for-newly-registered-doctor';
    
    return NextResponse.json({ message: 'Registration successful', token }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}