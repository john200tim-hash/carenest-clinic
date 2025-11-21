const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// --- Mongoose Models ---
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');

const app = express();
const PORT = process.env.PORT || 3001;

// --- MongoDB Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err));

app.use(cors());
app.use(express.json());

// --- Doctor Registration ---
const REGISTRATION_CODE = 'JOHN200TIM#';

app.post('/api/doctor/register', async (req, res) => {
  const { name, email, password, registrationCode } = req.body;
  if (registrationCode !== REGISTRATION_CODE) {
    return res.status(400).json({ message: 'Invalid registration code.' });
  }
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  try {
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(409).json({ message: 'A doctor with this email is already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const savedDoctor = await new Doctor({
      id: `doc_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
    }).save();

    const token = jwt.sign({ id: savedDoctor.id, email: savedDoctor.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({
      message: 'Registration successful!',
      token,
      id: savedDoctor.id,
      name: savedDoctor.name
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
});

// --- Doctor Login ---
app.post('/api/doctor/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: doctor.id, email: doctor.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token, id: doctor.id, name: doctor.name });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
});

// --- Authentication Middleware ---
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token is not valid' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// --- Protected Patient Routes ---
app.get('/api/patients', protect, async (req, res) => {
  try {
    const patients = await Patient.find({}).sort({ name: 1 });
    res.json(patients);
  } catch (error) {
    console.error('Fetch Patients Error:', error);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
});

app.get('/api/patients/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patient data' });
  }
});

app.put('/api/patients/:id', protect, async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(updatedPatient);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update patient', error: error.message });
  }
});

app.post('/api/patients/:patientId/:infoType', protect, async (req, res) => {
  const { patientId, infoType } = req.params;
  const data = req.body;
  try {
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    patient[infoType].push({ id: `${infoType.slice(0, 4)}_${Date.now()}`, ...data });
    await patient.save();
    res.status(201).json({ message: `${infoType} added successfully.` });
  } catch (error) {
    console.error(`Error adding ${infoType}:`, error);
    res.status(500).json({ message: `Failed to add ${infoType}` });
  }
});

// --- Protected Appointment Routes ---
app.get('/api/patients/:id/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.id });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

app.get('/api/doctors/:doctorId/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

app.put('/api/appointments/:appointmentId', protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const updatedAppointment = await Appointment.findOneAndUpdate({ id: appointmentId }, { status }, { new: true });
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update Appointment Error:', error);
    res.status(500).json({ message: 'Failed to update appointment status' });
  }
});

app.post('/api/appointments/doctor-create', protect, async (req, res) => {
  const { patientId, date, time, reason } = req.body;
  const doctorId = req.user.id;
  if (!patientId || !date || !time || !reason) {
    return res.status(400).json({ message: 'Patient, date, time, and reason are required.' });
  }
  try {
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    const newAppointment = await new Appointment({
      id: `appt_${Date.now()}`,
      patientId,
      doctorId,
      patientName: patient.name,
      date,
      time,
      reason,
      status: 'confirmed',
    }).save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Doctor Create Appointment Error:', error);
    res.status(500).json({ message: 'Failed to create appointment.' });
  }
});

app.post('/api/appointments/request', async (req, res) => {
  const { name, emailOrMobile, date, time, reason } = req.body;
  if (!name || !emailOrMobile || !date || !time || !reason) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const assignedDoctor = await Doctor.findOne({});
    if (!assignedDoctor) {
      return res.status(500).json({ message: 'No doctors are available in the system to handle appointments.' });
    }
    let patient = await Patient.findOne({ emailOrMobile });
    if (!patient) {
      patient = await new Patient({
        id: `pat_${Date.now()}`,
        name,
        dateOfBirth: new Date('1900-01-01'),
        gender: 'Not specified',
        emailOrMobile,
        contactNumber: emailOrMobile,
        address: 'Not specified',
      }).save();
    }
    await new Appointment({
      id: `appt_${Date.now()}`,
      patientId: patient.id,
      doctorId: assignedDoctor.id,
      patientName: patient.name,
      date,
      time,
      reason,
    }).save();
    res.status(201).json(patient); // Return the patient object as before
  } catch (error) {
    console.error('Appointment Request Error:', error);
    res.status(500).json({ message: 'Failed to process appointment request.' });
  }
});

app.get('/api/public/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Public Patient Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch public patient data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
