const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  contactInfo: { type: String, required: true },
  // Add other fields from your Patient type here
  // e.g., medicalHistory, appointments, etc.
});

const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;