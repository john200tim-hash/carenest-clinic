
export interface Appointment {
  id: string;
  patientId: string; 
  patientName: string;
  doctorId?: string;
  date: Date;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string; //Optional notes for the appointment
}

export {}; // This line makes the file a module and fixes the error.

