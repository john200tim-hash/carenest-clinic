// Example: src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PatientModel from '@/models/Patient';

export async function GET(request: Request) {
  await dbConnect();
  try {
    const patients = await PatientModel.find({});
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json({ message: 'Failed to fetch patients' }, { status: 500 });
  }
}
