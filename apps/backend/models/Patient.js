const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  emailOrMobile: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  medicalHistory: { type: String },

  // Define schemas for nested medical info arrays
  symptoms: [{ id: String, description: String, date: Date, severity: String }],
  diagnoses: [{ id: String, condition: String, date: Date, notes: String }],
  prescriptions: [{ id: String, medication: String, dosage: String, startDate: Date, endDate: Date }],
  bills: [{ id: String, amount: Number, date: Date, description: String, status: String }],
});

const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;