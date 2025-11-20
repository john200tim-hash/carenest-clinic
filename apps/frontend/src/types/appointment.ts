export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string; //Optional notes for the appointment
}
