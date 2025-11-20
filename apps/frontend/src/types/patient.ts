import { Appointment } from './appointment'; // Ensure this import is present
import { Symptom } from './symptom';
import { Diagnosis } from './diagnosis';
import { Bill } from './bill';
import { Prescription } from './prescription';

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: Date;
  gender: string;
  emailOrMobile?: string;
  contactNumber: string;
  address: string;
  medicalHistory?: string;

  // New fields for tracking medical information
  symptoms?: Symptom[];
  appointments?: Appointment[]; // <--- THIS IS THE MISSING PROPERTY
  diagnoses?: Diagnosis[];
  bills?: Bill[];
  prescriptions?: Prescription[];
}
