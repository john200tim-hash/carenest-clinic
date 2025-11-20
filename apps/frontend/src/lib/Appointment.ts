import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppointment extends Document {
  id: string; // Custom ID
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

const AppointmentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, ref: 'Patient' }, // Reference to Patient model
  doctorId: { type: String, required: true, ref: 'Doctor' },   // Reference to Doctor model
  date: { type: Date, required: true },
  time: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'confirmed', 'cancelled', 'completed'], default: 'scheduled' },
  notes: { type: String },
}, {
  timestamps: true,
});

const AppointmentModel: Model<IAppointment> = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
export default AppointmentModel;