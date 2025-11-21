const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, index: true }, // Reference to Patient
  patientName: { type: String, required: true },
  doctorId: { type: String, index: true }, // Reference to Doctor, can be assigned later
  date: { type: Date, required: true },
  time: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
}, {
  timestamps: true,
});

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
