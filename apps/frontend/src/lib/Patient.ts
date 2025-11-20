import mongoose, { Schema, Document, Model } from 'mongoose';
import { Symptom } from '@/types/symptom';
import { Diagnosis } from '@/types/diagnosis';
import { Bill } from '@/types/bill';
import { Prescription } from '@/types/prescription';

// Extend the Patient interface to include Mongoose Document methods
export interface IPatient extends Document {
  id: string; // Custom ID, not Mongoose's _id
  name: string;
  dateOfBirth: Date;
  gender: string;
  contactNumber: string;
  address: string;
  emailOrMobile?: string; // Added for patient login/registration
  medicalHistory?: string;
  symptoms?: Symptom[];
  diagnoses?: Diagnosis[];
  bills?: Bill[];
  prescriptions?: Prescription[];
}

const PatientSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true }, // Custom ID
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  emailOrMobile: { type: String, unique: true, sparse: true }, // Allow nulls but enforce uniqueness if present
  medicalHistory: { type: String },
  symptoms: [{
    id: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'], required: true },
    dateReported: { type: Date, required: true },
  }],
  diagnoses: [{
    id: { type: String, required: true },
    condition: { type: String, required: true },
    dateDiagnosed: { type: Date, required: true },
    notes: { type: String },
  }],
  bills: [{
    id: { type: String, required: true },
    service: { type: String, required: true },
    amount: { type: Number, required: true },
    dateIssued: { type: Date, required: true },
    status: { type: String, enum: ['paid', 'unpaid'], required: true },
  }],
  prescriptions: [{
    id: { type: String, required: true },
    medication: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    datePrescribed: { type: Date, required: true },
  }],
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Use existing model if it exists, otherwise create a new one
const PatientModel: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
export default PatientModel;