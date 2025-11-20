import { Patient } from "@/types/patient";
import { Doctor } from "@/types/doctor";
import { Appointment } from "@/types/appointment";
import { Symptom } from "@/types/symptom";
import { Diagnosis } from "@/types/diagnosis";
import { Bill } from "@/types/bill";
import { Prescription } from "@/types/prescription";

// This is our single, shared mock database.
export let mockPatients: Patient[] = [
  {
    id: 'PAT001',
    name: 'John Doe',
    dateOfBirth: new Date('1985-04-12'),
    contactNumber: '0712-345-678',
    emailOrMobile: 'john.doe@example.com',
    gender: 'Male',
    address: '123 Maple St, Springfield',
    symptoms: [
      { id: 'symp_001', description: 'Persistent headache', severity: 'mild', dateReported: new Date('2024-05-10') },
      { id: 'symp_002', description: 'Sore throat', severity: 'moderate', dateReported: new Date('2024-05-09') },
    ],
    diagnoses: [
      { id: 'diag_001', condition: 'Common Cold', dateDiagnosed: new Date('2024-05-10'), notes: 'Advised rest and hydration.' },
    ],
    bills: [
      { id: 'bill_001', service: 'General Consultation', amount: 75, dateIssued: new Date('2024-05-10'), status: 'unpaid' },
      { id: 'bill_002', service: 'Flu Shot', amount: 30, dateIssued: new Date('2023-10-15'), status: 'paid' },
    ],
    prescriptions: [
      { id: 'presc_001', medication: 'Ibuprofen', dosage: '400mg', frequency: 'Every 6 hours as needed', datePrescribed: new Date('2024-05-10') },
    ],
  },
  {
    id: 'PAT002',
    name: 'Jane Smith',
    dateOfBirth: new Date('1992-08-23'),
    contactNumber: '0722-112-233',
    emailOrMobile: 'jane.smith@example.com',
    gender: 'Female',
    address: '456 Oak Ave, Springfield',
    symptoms: [
      { id: 'symp_003', description: 'Sprained ankle', severity: 'moderate', dateReported: new Date('2024-04-20') },
    ],
    diagnoses: [
      { id: 'diag_002', condition: 'Ankle Sprain Grade II', dateDiagnosed: new Date('2024-04-20'), notes: 'RICE protocol recommended.' },
    ],
    bills: [
      { id: 'bill_003', service: 'X-Ray & Orthopedic Consultation', amount: 250, dateIssued: new Date('2024-04-20'), status: 'paid' },
    ],
    prescriptions: [
      { id: 'presc_002', medication: 'Naproxen', dosage: '500mg', frequency: 'Twice a day', datePrescribed: new Date('2024-04-20') },
    ],
  },
  {
    id: 'PAT003',
    name: 'Michael Johnson',
    dateOfBirth: new Date('1978-11-05'),
    contactNumber: '0733-445-566',
    emailOrMobile: 'michael.j@example.com',
    gender: 'Male',
    address: '789 Pine Ln, Springfield',
    symptoms: [
      { id: 'symp_004', description: 'High blood pressure readings', severity: 'moderate', dateReported: new Date('2024-03-15') },
    ],
    diagnoses: [
      { id: 'diag_003', condition: 'Hypertension', dateDiagnosed: new Date('2024-03-15'), notes: 'Lifestyle changes and medication prescribed.' },
    ],
    bills: [
      { id: 'bill_004', service: 'Cardiac Checkup', amount: 400, dateIssued: new Date('2024-03-15'), status: 'paid' },
    ],
    prescriptions: [
      { id: 'presc_003', medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', datePrescribed: new Date('2024-03-15') },
    ],
  },
  {
    id: 'PAT004',
    name: 'Emily Williams',
    dateOfBirth: new Date('2001-02-18'),
    contactNumber: '0744-556-677',
    emailOrMobile: 'emily.w@example.com',
    gender: 'Female',
    address: '101 Birch Rd, Springfield',
    symptoms: [],
    diagnoses: [{ id: 'diag_004', condition: 'Seasonal Allergies', dateDiagnosed: new Date('2024-04-01'), notes: 'Prescribed antihistamines.' }],
    bills: [
      { id: 'bill_005', service: 'Annual Physical Exam', amount: 150, dateIssued: new Date('2024-05-01'), status: 'unpaid' },
    ],
    prescriptions: [{ id: 'presc_004', medication: 'Loratadine', dosage: '10mg', frequency: 'Once daily', datePrescribed: new Date('2024-04-01') }],
  },
  {
    id: 'PAT005',
    name: 'David Brown',
    dateOfBirth: new Date('1965-07-30'),
    contactNumber: '0755-667-788',
    emailOrMobile: 'david.b@example.com',
    gender: 'Male',
    address: '212 Cedar Blvd, Springfield',
    symptoms: [
      { id: 'symp_005', description: 'Joint pain in knees', severity: 'severe', dateReported: new Date('2024-01-10') },
    ],
    diagnoses: [
      { id: 'diag_005', condition: 'Osteoarthritis', dateDiagnosed: new Date('2024-01-10'), notes: 'Physical therapy recommended.' },
    ],
    bills: [
      { id: 'bill_006', service: 'Rheumatology Consultation', amount: 220, dateIssued: new Date('2024-01-10'), status: 'paid' },
    ],
    prescriptions: [{ id: 'presc_005', medication: 'Meloxicam', dosage: '15mg', frequency: 'Once daily', datePrescribed: new Date('2024-01-10') }],
  },
];

// Add a mock doctors array
export let mockDoctors: any[] = [
    {
        id: 'DOC001',
        email: 'john200tim@gmail.com',
        password: 'password123' // In a real app, this should be hashed
    },
    {
        id: 'DOC002',
        email: 'emily.carter@captimed.com',
        password: 'carter456'
    },
    {
        id: 'DOC003',
        email: 'ben.martinez@captimed.com',
        password: 'martinez789'
    },
    {
        id: 'DOC004',
        email: 'olivia.chen@captimed.com',
        password: 'chen101'
    },
    {
        id: 'DOC005',
        email: 'sam.wright@captimed.com',
        password: 'wright202'
    }
];

// Add a mock appointments array
export let mockAppointments: any[] = [
  {
    id: 'appt1',
    patientId: 'PAT001', // Belongs to John Doe
    doctorId: 'DOC001',
    date: new Date('2024-05-20T10:00:00Z'),
    time: '10:00 AM',
    reason: 'Annual Checkup',
    status: 'confirmed',
  },
  {
    id: 'appt2',
    patientId: 'PAT002', // Belongs to Jane Smith
    doctorId: 'DOC002',
    date: new Date('2024-05-22T11:30:00Z'),
    time: '11:30 AM',
    reason: 'Follow-up on test results',
    status: 'scheduled',
  },
  {
    id: 'appt3',
    patientId: 'PAT001', // Belongs to John Doe
    doctorId: 'DOC003',
    date: new Date('2024-06-08T09:00:00Z'),
    time: '09:00 AM',
    reason: 'Flu Shot',
    status: 'scheduled',
  },
  {
    id: 'appt4',
    patientId: 'PAT003', // Belongs to Michael Johnson
    doctorId: 'DOC004',
    date: new Date('2024-06-10T14:00:00Z'),
    time: '02:00 PM',
    reason: 'Blood pressure follow-up',
    status: 'scheduled',
  },
  {
    id: 'appt5',
    patientId: 'PAT004', // Belongs to Emily Williams
    doctorId: 'DOC001',
    date: new Date('2024-05-25T10:30:00Z'),
    time: '10:30 AM',
    reason: 'Annual physical',
    status: 'confirmed',
  },
];

// In a real app, these functions would interact with a real database like PostgreSQL or MongoDB.
export const db = { mockPatients, mockDoctors, mockAppointments };
